pub mod constants;
pub mod error;
pub mod fixed;
pub mod instructions;
pub mod lmsr;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("4YRUWdfnuCXbUTxdKRLPLvwHKrzPkkgNLxN4Up4r9K9C");

#[program]
pub mod amm {
    use super::*;

    pub fn init_pool(ctx: Context<InitPool>, b: u64, fee_bps: u16) -> Result<()> {
        instructions::init_pool::handle_init_pool(ctx, b, fee_bps)
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        down_amount: u64,
        up_amount: u64,
    ) -> Result<()> {
        instructions::add_liquidity::handle_add_liquidity(ctx, down_amount, up_amount)
    }

    pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, lp_amount: u64) -> Result<()> {
        instructions::remove_liquidity::handle_remove_liquidity(ctx, lp_amount)
    }

    pub fn swap(
        ctx: Context<Swap>,
        side_in: SwapSide,
        amount_in: u64,
        min_amount_out: u64,
    ) -> Result<()> {
        instructions::swap::handle_swap(ctx, side_in, amount_in, min_amount_out)
    }
}
