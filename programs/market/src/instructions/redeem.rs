use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

use crate::{constants::*, error::MarketError, state::*};

#[derive(Accounts)]
pub struct Redeem<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [
            MARKET_SEED,
            market.asset_feed_id.as_ref(),
            market.strike_price.to_le_bytes().as_ref(),
            market.expiry_ts.to_le_bytes().as_ref()
        ],
        bump = market.bump,
        constraint = market.status == MarketStatus::Resolved @ MarketError::MarketNotResolved
    )]
    pub market: Box<Account<'info, Market>>,

    /// CHECK: PDA authority for the market's vault; never deserialized.
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

    #[account(mut)]
    pub user_down_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub user_up_account: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

pub fn handle_redeem(ctx: Context<Redeem>, amount: u64) -> Result<()> {
    let market_key = ctx.accounts.market.key();
    let vault_signer_seeds: &[&[u8]] = &[
        VAULT_SEED,
        market_key.as_ref(),
        &[ctx.accounts.market.vault_authority_bump],
    ];
    let signer_seeds = &[vault_signer_seeds];

    match ctx.accounts.market.outcome {
        MarketOutcome::Down => {
            token::burn(
                CpiContext::new(
                    ctx.accounts.token_program.key(),
                    Burn {
                        mint: ctx.accounts.down_mint.to_account_info(),
                        from: ctx.accounts.user_down_account.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                amount,
            )?;
        }
        MarketOutcome::Up => {
            token::burn(
                CpiContext::new(
                    ctx.accounts.token_program.key(),
                    Burn {
                        mint: ctx.accounts.up_mint.to_account_info(),
                        from: ctx.accounts.user_up_account.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                amount,
            )?;
        }
        MarketOutcome::Unresolved => {
            return err!(MarketError::MarketNotResolved);
        }
    }

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.collateral_token_account.to_account_info(),
                to: ctx.accounts.user_usdc_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    Ok(())
}
