use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

use market::{Market, MarketStatus};

use crate::{constants::*, error::AmmError, state::*};

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        constraint = market.status == MarketStatus::Active @ AmmError::MarketNotActive
    )]
    pub market: Box<Account<'info, Market>>,

    #[account(
        seeds = [AMM_SEED, market.key().as_ref()],
        bump = amm_pool.bump,
    )]
    pub amm_pool: Box<Account<'info, AmmPool>>,

    #[account(mut, address = amm_pool.lp_mint)]
    pub lp_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub pool_down_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub pool_up_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub user_down_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub user_up_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub user_lp_account: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

pub fn handle_remove_liquidity(ctx: Context<RemoveLiquidity>, lp_amount: u64) -> Result<()> {
    require!(lp_amount > 0, AmmError::MathOverflow);
    let lp_supply = ctx.accounts.lp_mint.supply;
    require!(lp_supply > 0, AmmError::EmptyPool);

    let pool_down_bal = ctx.accounts.pool_down_account.amount;
    let pool_up_bal = ctx.accounts.pool_up_account.amount;

    let down_out: u64 = ((pool_down_bal as u128)
        .checked_mul(lp_amount as u128)
        .ok_or(AmmError::MathOverflow)?
        .checked_div(lp_supply as u128)
        .ok_or(AmmError::MathOverflow)?)
    .try_into()
    .map_err(|_| AmmError::MathOverflow)?;
    let up_out: u64 = ((pool_up_bal as u128)
        .checked_mul(lp_amount as u128)
        .ok_or(AmmError::MathOverflow)?
        .checked_div(lp_supply as u128)
        .ok_or(AmmError::MathOverflow)?)
    .try_into()
    .map_err(|_| AmmError::MathOverflow)?;

    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Burn {
                mint: ctx.accounts.lp_mint.to_account_info(),
                from: ctx.accounts.user_lp_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        lp_amount,
    )?;

    let market_key = ctx.accounts.market.key();
    let pool_signer_seeds: &[&[u8]] = &[
        AMM_SEED,
        market_key.as_ref(),
        &[ctx.accounts.amm_pool.bump],
    ];
    let signer_seeds = &[pool_signer_seeds];

    if down_out > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.pool_down_account.to_account_info(),
                    to: ctx.accounts.user_down_account.to_account_info(),
                    authority: ctx.accounts.amm_pool.to_account_info(),
                },
                signer_seeds,
            ),
            down_out,
        )?;
    }
    if up_out > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.pool_up_account.to_account_info(),
                    to: ctx.accounts.user_up_account.to_account_info(),
                    authority: ctx.accounts.amm_pool.to_account_info(),
                },
                signer_seeds,
            ),
            up_out,
        )?;
    }

    Ok(())
}
