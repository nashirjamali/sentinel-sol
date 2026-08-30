pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("AdPs1Q41NKPZjJrMuodth7Jis2Utd8NqMi2qzknTnBAN");

#[program]
pub mod market {
    use super::*;

    pub fn create_market(
        ctx: Context<CreateMarket>,
        asset_feed_id: Pubkey,
        strike_price: u64,
        expiry_ts: i64,
    ) -> Result<()> {
        instructions::create_market::handle_create_market(
            ctx,
            asset_feed_id,
            strike_price,
            expiry_ts,
        )
    }

    pub fn mint_complete_set(ctx: Context<MintCompleteSet>, amount: u64) -> Result<()> {
        instructions::mint_complete_set::handle_mint_complete_set(ctx, amount)
    }

    pub fn merge_complete_set(ctx: Context<MergeCompleteSet>, amount: u64) -> Result<()> {
        instructions::merge_complete_set::handle_merge_complete_set(ctx, amount)
    }

    pub fn redeem(ctx: Context<Redeem>, amount: u64) -> Result<()> {
        instructions::redeem::handle_redeem(ctx, amount)
    }

    pub fn apply_resolution(
        ctx: Context<ApplyResolution>,
        outcome: MarketOutcome,
        resolved_price: u64,
        resolved_at: i64,
    ) -> Result<()> {
        instructions::apply_resolution::handle_apply_resolution(
            ctx,
            outcome,
            resolved_price,
            resolved_at,
        )
    }
}
