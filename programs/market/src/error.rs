use anchor_lang::prelude::*;

#[error_code]
pub enum MarketError {
    #[msg("Market is not active")]
    MarketNotActive,
    #[msg("Market is not yet resolved")]
    MarketNotResolved,
    #[msg("Trading is halted in the window before expiry")]
    TradingHalted,
    #[msg("Insufficient collateral to mint the requested amount")]
    InsufficientCollateral,
    #[msg("Signer is not the appropriate admin")]
    Unauthorized,
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Risk config for this asset is missing or disabled")]
    InvalidRiskConfig,
    #[msg("Expiry must be far enough in the future to clear the trading halt window")]
    ExpiryTooSoon,
    #[msg("Arithmetic overflow/underflow")]
    MathOverflow,
    #[msg("Outcome must be Down or Up, never Unresolved")]
    InvalidOutcome,
}
