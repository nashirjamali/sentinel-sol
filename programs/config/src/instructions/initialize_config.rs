use anchor_lang::prelude::*;

use crate::{constants::*, state::GlobalConfig};

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + GlobalConfig::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_config(ctx: Context<InitializeConfig>, admin: Pubkey) -> Result<()> {
    let global_config = &mut ctx.accounts.global_config;
    global_config.admin = admin;
    global_config.pending_admin = None;
    global_config.paused = false;
    global_config.bump = ctx.bumps.global_config;
    Ok(())
}
