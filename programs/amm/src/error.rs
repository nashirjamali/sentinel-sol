use anchor_lang::prelude::*;

#[error_code]
pub enum AmmError {
    #[msg("Market is not active")]
    MarketNotActive,
    #[msg("Trading is halted in the window before expiry")]
    TradingHalted,
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Signer is not the appropriate admin")]
    Unauthorized,
    #[msg("b is below RiskConfig.lmsr_b_min for this asset")]
    LiquidityBelowMinimum,
    #[msg("add_liquidity requires equal DOWN and UP amounts in the MVP")]
    InvalidLiquidityRatio,
    #[msg("Slippage exceeded: amount_out is below min_amount_out")]
    SlippageExceeded,
    #[msg("Pool has no liquidity")]
    EmptyPool,
    #[msg("Arithmetic overflow/underflow")]
    MathOverflow,
    #[msg("LMSR math error")]
    LmsrMathError,
}

impl From<crate::fixed::FixedError> for AmmError {
    fn from(_: crate::fixed::FixedError) -> Self {
        AmmError::LmsrMathError
    }
}
