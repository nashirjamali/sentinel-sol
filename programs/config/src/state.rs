use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    pub admin: Pubkey,
    pub pending_admin: Option<Pubkey>,
    pub paused: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct RiskConfig {
    pub asset_feed_id: Pubkey,
    pub max_staleness_secs: i64,
    pub max_confidence_bps: u16,
    pub trading_halt_secs: i64,
    pub lmsr_b_min: u64,
    pub enabled: bool,
    pub bump: u8,
}
