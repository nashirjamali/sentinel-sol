use anchor_lang::prelude::*;

use crate::{constants::*, error::MarketError, state::*};

/// Mutates `Market` on resolution. Only callable via CPI from `resolution_program`'s own
/// resolver PDA — `resolution_program` is the one that verifies the Pyth oracle data; this
/// instruction trusts that verification happened and just applies the outcome, since only the
/// owning program (`market_program`) may write `Market`'s account data.
#[derive(Accounts)]
pub struct ApplyResolution<'info> {
    #[account(
        seeds = [RESOLVER_SEED],
        bump,
        seeds::program = RESOLUTION_PROGRAM_ID
    )]
    pub resolver_authority: Signer<'info>,

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
    pub market: Account<'info, Market>,
}

pub fn handle_apply_resolution(
    ctx: Context<ApplyResolution>,
    outcome: MarketOutcome,
    resolved_price: u64,
    resolved_at: i64,
) -> Result<()> {
    require!(
        outcome != MarketOutcome::Unresolved,
        MarketError::InvalidOutcome
    );

    let market = &mut ctx.accounts.market;
    market.outcome = outcome;
    market.status = MarketStatus::Resolved;
    market.resolved_price = Some(resolved_price);
    market.resolved_at = Some(resolved_at);
    Ok(())
}
