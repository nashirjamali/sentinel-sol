use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct AmmPool {
    pub market: Pubkey,
    pub b: u64,
    pub q_down: i64,
    pub q_up: i64,
    pub fee_bps: u16,
    pub lp_mint: Pubkey,
    pub bump: u8,
}
