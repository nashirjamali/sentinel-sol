use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use config::{GlobalConfig, RiskConfig, CONFIG_SEED, RISK_SEED};
use market::{Market, MarketStatus};

use crate::{constants::*, error::AmmError, lmsr, state::*};

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = global_config.bump,
        seeds::program = config::ID,
        constraint = !global_config.paused @ AmmError::ProtocolPaused
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    #[account(
        seeds = [RISK_SEED, market.asset_feed_id.as_ref()],
        bump = risk_config.bump,
        seeds::program = config::ID,
    )]
    pub risk_config: Box<Account<'info, RiskConfig>>,

    #[account(
        constraint = market.status == MarketStatus::Active @ AmmError::MarketNotActive
    )]
    pub market: Box<Account<'info, Market>>,

    #[account(
        mut,
        seeds = [AMM_SEED, market.key().as_ref()],
        bump = amm_pool.bump,
    )]
    pub amm_pool: Box<Account<'info, AmmPool>>,

    #[account(mut)]
    pub pool_down_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub pool_up_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub user_down_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub user_up_account: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum SwapSide {
    Down,
    Up,
}

pub fn handle_swap(
    ctx: Context<Swap>,
    side_in: SwapSide,
    amount_in: u64,
    min_amount_out: u64,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(
        now < ctx.accounts.market.expiry_ts - ctx.accounts.risk_config.trading_halt_secs,
        AmmError::TradingHalted
    );
    require!(amount_in > 0, AmmError::MathOverflow);

    let pool = &ctx.accounts.amm_pool;
    let lmsr_side = match side_in {
        SwapSide::Down => lmsr::Side::Down,
        SwapSide::Up => lmsr::Side::Up,
    };
    let gross_amount_out =
        lmsr::swap_amount_out(pool.q_down, pool.q_up, pool.b, lmsr_side, amount_in)
            .map_err(AmmError::from)?;
    let net_amount_out =
        lmsr::apply_fee(gross_amount_out, pool.fee_bps).map_err(AmmError::from)?;

    require!(
        net_amount_out >= min_amount_out,
        AmmError::SlippageExceeded
    );

    let (user_in_account, pool_in_account, user_out_account, pool_out_account) = match side_in {
        SwapSide::Down => (
            &ctx.accounts.user_down_account,
            &ctx.accounts.pool_down_account,
            &ctx.accounts.user_up_account,
            &ctx.accounts.pool_up_account,
        ),
        SwapSide::Up => (
            &ctx.accounts.user_up_account,
            &ctx.accounts.pool_up_account,
            &ctx.accounts.user_down_account,
            &ctx.accounts.pool_down_account,
        ),
    };

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: user_in_account.to_account_info(),
                to: pool_in_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount_in,
    )?;

    let market_key = ctx.accounts.market.key();
    let pool_signer_seeds: &[&[u8]] = &[
        AMM_SEED,
        market_key.as_ref(),
        &[ctx.accounts.amm_pool.bump],
    ];
    let signer_seeds = &[pool_signer_seeds];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            Transfer {
                from: pool_out_account.to_account_info(),
                to: user_out_account.to_account_info(),
                authority: ctx.accounts.amm_pool.to_account_info(),
            },
            signer_seeds,
        ),
        net_amount_out,
    )?;

    let pool = &mut ctx.accounts.amm_pool;
    match side_in {
        SwapSide::Down => {
            pool.q_down = pool
                .q_down
                .checked_sub(amount_in as i64)
                .ok_or(AmmError::MathOverflow)?;
            pool.q_up = pool
                .q_up
                .checked_add(gross_amount_out as i64)
                .ok_or(AmmError::MathOverflow)?;
        }
        SwapSide::Up => {
            pool.q_up = pool
                .q_up
                .checked_sub(amount_in as i64)
                .ok_or(AmmError::MathOverflow)?;
            pool.q_down = pool
                .q_down
                .checked_add(gross_amount_out as i64)
                .ok_or(AmmError::MathOverflow)?;
        }
    }

    Ok(())
}
