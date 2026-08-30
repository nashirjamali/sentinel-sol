use anchor_lang::prelude::*;

use crate::{constants::*, error::ConfigError, state::GlobalConfig};

#[derive(Accounts)]
pub struct SetPaused<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = global_config.bump,
        has_one = admin @ ConfigError::Unauthorized
    )]
    pub global_config: Account<'info, GlobalConfig>,
    pub admin: Signer<'info>,
}

pub fn handle_set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
    ctx.accounts.global_config.paused = paused;
    Ok(())
}
