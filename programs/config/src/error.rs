use anchor_lang::prelude::*;

#[error_code]
pub enum ConfigError {
    #[msg("Signer is not the appropriate admin or pending admin")]
    Unauthorized,
    #[msg("Risk config values are invalid")]
    InvalidRiskConfig,
}
