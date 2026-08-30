use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use config::{GlobalConfig, RiskConfig, CONFIG_SEED, RISK_SEED};

use crate::{constants::*, error::MarketError, state::*};

#[derive(Accounts)]
#[instruction(asset_feed_id: Pubkey, strike_price: u64, expiry_ts: i64)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = global_config.bump,
        seeds::program = config::ID,
        has_one = admin @ MarketError::Unauthorized,
        constraint = !global_config.paused @ MarketError::ProtocolPaused
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    #[account(
        seeds = [RISK_SEED, asset_feed_id.as_ref()],
        bump = risk_config.bump,
        seeds::program = config::ID,
        constraint = risk_config.enabled @ MarketError::InvalidRiskConfig
    )]
    pub risk_config: Box<Account<'info, RiskConfig>>,

    #[account(
        init,
        payer = admin,
        space = 8 + Market::INIT_SPACE,
        seeds = [MARKET_SEED, asset_feed_id.as_ref(), strike_price.to_le_bytes().as_ref(), expiry_ts.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Box<Account<'info, Market>>,

    /// CHECK: PDA used only as the mint/token authority; never deserialized.
    #[account(
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = admin,
        mint::decimals = 6,
        mint::authority = vault_authority,
    )]
    pub down_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = admin,
        mint::decimals = 6,
        mint::authority = vault_authority,
    )]
    pub up_mint: Box<Account<'info, Mint>>,

    pub usdc_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = admin,
        associated_token::mint = usdc_mint,
        associated_token::authority = vault_authority,
    )]
    pub collateral_token_account: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_create_market(
    ctx: Context<CreateMarket>,
    asset_feed_id: Pubkey,
    strike_price: u64,
    expiry_ts: i64,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(
        expiry_ts > now + ctx.accounts.risk_config.trading_halt_secs,
        MarketError::ExpiryTooSoon
    );

    let market = &mut ctx.accounts.market;
    market.asset_feed_id = asset_feed_id;
    market.strike_price = strike_price;
    market.expiry_ts = expiry_ts;
    market.down_mint = ctx.accounts.down_mint.key();
    market.up_mint = ctx.accounts.up_mint.key();
    market.vault_authority = ctx.accounts.vault_authority.key();
    market.collateral_token_account = ctx.accounts.collateral_token_account.key();
    market.total_collateral = 0;
    market.status = MarketStatus::Active;
    market.outcome = MarketOutcome::Unresolved;
    market.resolved_price = None;
    market.resolved_at = None;
    market.bump = ctx.bumps.market;
    market.vault_authority_bump = ctx.bumps.vault_authority;
    Ok(())
}
