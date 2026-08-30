use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use config::{GlobalConfig, RiskConfig, CONFIG_SEED, RISK_SEED};
use market::{Market, MarketStatus};

use crate::{constants::*, error::AmmError, state::*};

#[derive(Accounts)]
#[instruction(b: u64, fee_bps: u16)]
pub struct InitPool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = global_config.bump,
        seeds::program = config::ID,
        has_one = admin @ AmmError::Unauthorized,
        constraint = !global_config.paused @ AmmError::ProtocolPaused
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,

    #[account(
        seeds = [RISK_SEED, market.asset_feed_id.as_ref()],
        bump = risk_config.bump,
        seeds::program = config::ID,
        constraint = b >= risk_config.lmsr_b_min @ AmmError::LiquidityBelowMinimum
    )]
    pub risk_config: Box<Account<'info, RiskConfig>>,

    #[account(
        constraint = market.status == MarketStatus::Active @ AmmError::MarketNotActive
    )]
    pub market: Box<Account<'info, Market>>,

    #[account(
        init,
        payer = admin,
        space = 8 + AmmPool::INIT_SPACE,
        seeds = [AMM_SEED, market.key().as_ref()],
        bump
    )]
    pub amm_pool: Box<Account<'info, AmmPool>>,

    #[account(
        init,
        payer = admin,
        mint::decimals = 6,
        mint::authority = amm_pool,
    )]
    pub lp_mint: Box<Account<'info, Mint>>,

    #[account(address = market.down_mint)]
    pub down_mint: Box<Account<'info, Mint>>,

    #[account(address = market.up_mint)]
    pub up_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = admin,
        associated_token::mint = down_mint,
        associated_token::authority = amm_pool,
    )]
    pub pool_down_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = admin,
        associated_token::mint = up_mint,
        associated_token::authority = amm_pool,
    )]
    pub pool_up_account: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_init_pool(ctx: Context<InitPool>, b: u64, fee_bps: u16) -> Result<()> {
    let pool = &mut ctx.accounts.amm_pool;
    pool.market = ctx.accounts.market.key();
    pool.b = b;
    pool.q_down = 0;
    pool.q_up = 0;
    pool.fee_bps = fee_bps;
    pool.lp_mint = ctx.accounts.lp_mint.key();
    pool.bump = ctx.bumps.amm_pool;
    Ok(())
}
