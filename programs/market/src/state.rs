use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum MarketStatus {
    Active,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum MarketOutcome {
    Unresolved,
    Down,
    Up,
}

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub asset_feed_id: Pubkey,
    pub strike_price: u64,
    pub expiry_ts: i64,
    pub down_mint: Pubkey,
    pub up_mint: Pubkey,
    pub vault_authority: Pubkey,
    pub collateral_token_account: Pubkey,
    pub total_collateral: u64,
    pub status: MarketStatus,
    pub outcome: MarketOutcome,
    pub resolved_price: Option<u64>,
    pub resolved_at: Option<i64>,
    pub bump: u8,
    pub vault_authority_bump: u8,
}
