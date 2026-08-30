pub mod constants;
pub mod error;
mod fixture_gen;
pub mod instructions;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;

declare_id!("29kJzCm1CDTm9MHHFHJUSM2k31XKxLtGAeHjVEooUAu9");

#[program]
pub mod resolution {
    use super::*;

    pub fn resolve_market(ctx: Context<ResolveMarket>) -> Result<()> {
        instructions::resolve_market::handle_resolve_market(ctx)
    }
}
