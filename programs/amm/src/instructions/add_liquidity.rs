use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

use market::{Market, MarketStatus};

use crate::{
    constants::*,
    error::AmmError,
    fixed::{wad_mul, WAD},
    lmsr,
    state::*,
};

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

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

    #[account(mut, address = amm_pool.lp_mint)]
    pub lp_mint: Box<Account<'info, Mint>>,

    #[account(mut, address = market.down_mint)]
    pub down_mint: Box<Account<'info, Mint>>,

    #[account(mut, address = market.up_mint)]
    pub up_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub pool_down_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub pool_up_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub user_down_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub user_up_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = lp_mint,
        associated_token::authority = user,
    )]
    pub user_lp_account: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_add_liquidity(
    ctx: Context<AddLiquidity>,
    down_amount: u64,
    up_amount: u64,
) -> Result<()> {
    require!(down_amount == up_amount, AmmError::InvalidLiquidityRatio);
    require!(down_amount > 0, AmmError::InvalidLiquidityRatio);

    let pool = &ctx.accounts.amm_pool;
    let price_down = lmsr::price_down(pool.q_down, pool.q_up, pool.b).map_err(AmmError::from)?;
    let price_up = WAD.checked_sub(price_down).ok_or(AmmError::MathOverflow)?;

    let contribution_value = value_of(down_amount, up_amount, price_down, price_up)?;

    let lp_supply = ctx.accounts.lp_mint.supply;
    let lp_to_mint: u64 = if lp_supply == 0 {
        contribution_value
    } else {
        let pool_down_bal = ctx.accounts.pool_down_account.amount;
        let pool_up_bal = ctx.accounts.pool_up_account.amount;
        let pool_value = value_of(pool_down_bal, pool_up_bal, price_down, price_up)?;
        require!(pool_value > 0, AmmError::EmptyPool);
        ((lp_supply as u128)
            .checked_mul(contribution_value as u128)
            .ok_or(AmmError::MathOverflow)?
            .checked_div(pool_value as u128)
            .ok_or(AmmError::MathOverflow)?)
        .try_into()
        .map_err(|_| AmmError::MathOverflow)?
    };
    require!(lp_to_mint > 0, AmmError::MathOverflow);

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.user_down_account.to_account_info(),
                to: ctx.accounts.pool_down_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        down_amount,
    )?;
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.user_up_account.to_account_info(),
                to: ctx.accounts.pool_up_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        up_amount,
    )?;

    let market_key = ctx.accounts.market.key();
    let pool_signer_seeds: &[&[u8]] = &[
        AMM_SEED,
        market_key.as_ref(),
        &[ctx.accounts.amm_pool.bump],
    ];
    let signer_seeds = &[pool_signer_seeds];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            MintTo {
                mint: ctx.accounts.lp_mint.to_account_info(),
                to: ctx.accounts.user_lp_account.to_account_info(),
                authority: ctx.accounts.amm_pool.to_account_info(),
            },
            signer_seeds,
        ),
        lp_to_mint,
    )?;

    Ok(())
}

fn value_of(down_amount: u64, up_amount: u64, price_down: i128, price_up: i128) -> Result<u64> {
    let down_value = wad_mul(native_to_wad(down_amount)?, price_down).map_err(AmmError::from)?;
    let up_value = wad_mul(native_to_wad(up_amount)?, price_up).map_err(AmmError::from)?;
    let total_wad = down_value
        .checked_add(up_value)
        .ok_or(AmmError::MathOverflow)?;
    wad_to_native(total_wad)
}

fn native_to_wad(x: u64) -> Result<i128> {
    Ok((x as i128)
        .checked_mul(1_000_000_000_000)
        .ok_or(AmmError::MathOverflow)?)
}

fn wad_to_native(x: i128) -> Result<u64> {
    let v = x
        .checked_div(1_000_000_000_000)
        .ok_or(AmmError::MathOverflow)?;
    Ok(u64::try_from(v).map_err(|_| AmmError::MathOverflow)?)
}
