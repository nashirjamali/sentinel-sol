use anchor_lang::prelude::*;

use crate::{constants::*, error::ConfigError, state::GlobalConfig};

#[derive(Accounts)]
pub struct AcceptAdmin<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = global_config.bump,
        constraint = global_config.pending_admin == Some(pending_admin.key()) @ ConfigError::Unauthorized
    )]
    pub global_config: Account<'info, GlobalConfig>,
    pub pending_admin: Signer<'info>,
}

pub fn handle_accept_admin(ctx: Context<AcceptAdmin>) -> Result<()> {
    let global_config = &mut ctx.accounts.global_config;
    global_config.admin = ctx.accounts.pending_admin.key();
    global_config.pending_admin = None;
    Ok(())
}
