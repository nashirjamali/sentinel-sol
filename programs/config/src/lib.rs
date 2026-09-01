pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("HczupjcktZTYtecWhmcCYnDnRM4KJRFZ23k9oSnSygku");

#[program]
pub mod config {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, admin: Pubkey) -> Result<()> {
        instructions::initialize_config::handle_initialize_config(ctx, admin)
    }

    pub fn set_pending_admin(ctx: Context<SetPendingAdmin>, new_admin: Pubkey) -> Result<()> {
        instructions::set_pending_admin::handle_set_pending_admin(ctx, new_admin)
    }

    pub fn accept_admin(ctx: Context<AcceptAdmin>) -> Result<()> {
        instructions::accept_admin::handle_accept_admin(ctx)
    }

    pub fn set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
        instructions::set_paused::handle_set_paused(ctx, paused)
    }

    #[allow(clippy::too_many_arguments)]
    pub fn upsert_risk_config(
        ctx: Context<UpsertRiskConfig>,
        asset_feed_id: Pubkey,
        max_staleness_secs: i64,
        max_confidence_bps: u16,
        trading_halt_secs: i64,
        lmsr_b_min: u64,
        enabled: bool,
    ) -> Result<()> {
        instructions::upsert_risk_config::handle_upsert_risk_config(
            ctx,
            asset_feed_id,
            max_staleness_secs,
            max_confidence_bps,
            trading_halt_secs,
            lmsr_b_min,
            enabled,
        )
    }
}
