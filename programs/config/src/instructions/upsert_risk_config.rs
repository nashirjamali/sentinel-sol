use anchor_lang::prelude::*;

use crate::{constants::*, error::ConfigError, state::{GlobalConfig, RiskConfig}};

#[derive(Accounts)]
#[instruction(asset_feed_id: Pubkey)]
pub struct UpsertRiskConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [CONFIG_SEED],
        bump = global_config.bump,
        has_one = admin @ ConfigError::Unauthorized
    )]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + RiskConfig::INIT_SPACE,
        seeds = [RISK_SEED, asset_feed_id.as_ref()],
        bump
    )]
    pub risk_config: Account<'info, RiskConfig>,
    pub system_program: Program<'info, System>,
}

#[allow(clippy::too_many_arguments)]
pub fn handle_upsert_risk_config(
    ctx: Context<UpsertRiskConfig>,
    asset_feed_id: Pubkey,
    max_staleness_secs: i64,
    max_confidence_bps: u16,
    trading_halt_secs: i64,
    lmsr_b_min: u64,
    enabled: bool,
) -> Result<()> {
    require!(max_staleness_secs > 0, ConfigError::InvalidRiskConfig);
    require!(max_confidence_bps <= 10_000, ConfigError::InvalidRiskConfig);
    require!(trading_halt_secs > 0, ConfigError::InvalidRiskConfig);

    // TODO(governance-timelock): upsert_risk_config takes effect immediately in the MVP
    // admin-multisig phase. Per docs/PROGRAM_SPEC.md and CLAUDE.md, this must go through a
    // timelock before mainnet — it is the one governance action allowed to bypass it for now.
    let risk_config = &mut ctx.accounts.risk_config;
    risk_config.asset_feed_id = asset_feed_id;
    risk_config.max_staleness_secs = max_staleness_secs;
    risk_config.max_confidence_bps = max_confidence_bps;
    risk_config.trading_halt_secs = trading_halt_secs;
    risk_config.lmsr_b_min = lmsr_b_min;
    risk_config.enabled = enabled;
    risk_config.bump = ctx.bumps.risk_config;
    Ok(())
}
