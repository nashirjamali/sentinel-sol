use anchor_lang::prelude::*;

use crate::{constants::*, error::ConfigError, state::GlobalConfig};

#[derive(Accounts)]
pub struct SetPendingAdmin<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = global_config.bump,
        has_one = admin @ ConfigError::Unauthorized
    )]
    pub global_config: Account<'info, GlobalConfig>,
    pub admin: Signer<'info>,
}

pub fn handle_set_pending_admin(ctx: Context<SetPendingAdmin>, new_admin: Pubkey) -> Result<()> {
    ctx.accounts.global_config.pending_admin = Some(new_admin);
    Ok(())
}
