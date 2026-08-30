use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount, Transfer},
};

use config::{GlobalConfig, RiskConfig, CONFIG_SEED, RISK_SEED};

use crate::{constants::*, error::MarketError, state::*};

#[derive(Accounts)]
pub struct MintCompleteSet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = global_config.bump,
        seeds::program = config::ID,
        constraint = !global_config.paused @ MarketError::ProtocolPaused
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    #[account(
        seeds = [RISK_SEED, market.asset_feed_id.as_ref()],
        bump = risk_config.bump,
        seeds::program = config::ID,
    )]
    pub risk_config: Box<Account<'info, RiskConfig>>,

    #[account(
        mut,
        seeds = [
            MARKET_SEED,
            market.asset_feed_id.as_ref(),
            market.strike_price.to_le_bytes().as_ref(),
            market.expiry_ts.to_le_bytes().as_ref()
        ],
        bump = market.bump,
        constraint = market.status == MarketStatus::Active @ MarketError::MarketNotActive
    )]
    pub market: Box<Account<'info, Market>>,

    /// CHECK: PDA authority for the market's mints and vault; never deserialized.
    #[account(
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump = market.vault_authority_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut, address = market.down_mint)]
    pub down_mint: Box<Account<'info, Mint>>,

    #[account(mut, address = market.up_mint)]
    pub up_mint: Box<Account<'info, Mint>>,

    #[account(mut, address = market.collateral_token_account)]
    pub collateral_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub user_usdc_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = down_mint,
        associated_token::authority = user,
    )]
    pub user_down_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = up_mint,
        associated_token::authority = user,
    )]
    pub user_up_account: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_mint_complete_set(ctx: Context<MintCompleteSet>, amount: u64) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(
        now < ctx.accounts.market.expiry_ts - ctx.accounts.risk_config.trading_halt_secs,
        MarketError::TradingHalted
    );
    require!(
        ctx.accounts.user_usdc_account.amount >= amount,
        MarketError::InsufficientCollateral
    );

    // Transfer USDC from the user into the vault.
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.user_usdc_account.to_account_info(),
                to: ctx.accounts.collateral_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;

    let market_key = ctx.accounts.market.key();
    let vault_signer_seeds: &[&[u8]] = &[
        VAULT_SEED,
        market_key.as_ref(),
        &[ctx.accounts.market.vault_authority_bump],
    ];
    let signer_seeds = &[vault_signer_seeds];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            MintTo {
                mint: ctx.accounts.down_mint.to_account_info(),
                to: ctx.accounts.user_down_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            MintTo {
                mint: ctx.accounts.up_mint.to_account_info(),
                to: ctx.accounts.user_up_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    let market = &mut ctx.accounts.market;
    market.total_collateral = market
        .total_collateral
        .checked_add(amount)
        .ok_or(MarketError::MathOverflow)?;

    Ok(())
}
