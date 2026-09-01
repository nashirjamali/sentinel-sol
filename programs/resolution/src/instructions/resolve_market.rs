use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

use config::{RiskConfig, RISK_SEED};
use market::{Market, MarketOutcome, MarketStatus};

use crate::{constants::*, error::ResolutionError};

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    /// Permissionless keeper — anyone may call this once the market has expired.
    pub keeper: Signer<'info>,

    #[account(
        seeds = [RISK_SEED, market.asset_feed_id.as_ref()],
        bump = risk_config.bump,
        seeds::program = config::ID,
    )]
    pub risk_config: Box<Account<'info, RiskConfig>>,

    #[account(
        mut,
        constraint = market.status == MarketStatus::Active @ ResolutionError::MarketAlreadyResolved
    )]
    pub market: Box<Account<'info, Market>>,

    pub price_update: Box<Account<'info, PriceUpdateV2>>,

    /// CHECK: PDA used only to sign the CPI into `market_program::apply_resolution`; never
    /// deserialized. `market_program` independently verifies this address is derived from
    /// `resolution_program`'s own ID before trusting the call.
    #[account(seeds = [RESOLVER_SEED], bump)]
    pub resolver_authority: UncheckedAccount<'info>,

    pub market_program: Program<'info, market::program::Market>,
}

pub fn handle_resolve_market(ctx: Context<ResolveMarket>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let market = &ctx.accounts.market;
    require!(now >= market.expiry_ts, ResolutionError::MarketNotYetExpired);

    let risk_config = &ctx.accounts.risk_config;
    let price_update = &ctx.accounts.price_update;

    // market.asset_feed_id doubles as the Pyth FeedId (both are opaque 32-byte identifiers) —
    // see docs/libs/PROGRAM_SPEC.md §1: `asset_feed_id` is the feed this market resolves against.
    let feed_id = market.asset_feed_id.to_bytes();
    require!(
        price_update.price_message.feed_id == feed_id,
        ResolutionError::OracleFeedMismatch
    );

    let publish_time = price_update.price_message.publish_time;
    require!(
        publish_time >= now.saturating_sub(risk_config.max_staleness_secs),
        ResolutionError::OraclePriceStale
    );

    let price = price_update.price_message.price;
    require!(price >= 0, ResolutionError::NegativeOraclePrice);
    let conf = price_update.price_message.conf;

    // conf * 10_000 / price <= max_confidence_bps, using u128 to avoid overflow.
    let confidence_bps: u128 = (conf as u128)
        .checked_mul(10_000)
        .ok_or(ResolutionError::MathOverflow)?
        .checked_div(price as u128)
        .ok_or(ResolutionError::MathOverflow)?;
    require!(
        confidence_bps <= risk_config.max_confidence_bps as u128,
        ResolutionError::OracleConfidenceTooWide
    );

    let outcome = if (price as u64) < market.strike_price {
        MarketOutcome::Down
    } else {
        MarketOutcome::Up
    };

    let bump = ctx.bumps.resolver_authority;
    let signer_seeds: &[&[u8]] = &[RESOLVER_SEED, &[bump]];
    let signer = &[signer_seeds];

    let cpi_accounts = market::cpi::accounts::ApplyResolution {
        resolver_authority: ctx.accounts.resolver_authority.to_account_info(),
        market: ctx.accounts.market.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.market_program.key(),
        cpi_accounts,
        signer,
    );
    market::cpi::apply_resolution(cpi_ctx, outcome, price as u64, now)?;

    Ok(())
}
