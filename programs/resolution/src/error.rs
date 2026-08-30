use anchor_lang::prelude::*;

#[error_code]
pub enum ResolutionError {
    #[msg("Market is not yet expired")]
    MarketNotYetExpired,
    #[msg("Market has already been resolved")]
    MarketAlreadyResolved,
    #[msg("Pyth price update is older than RiskConfig.max_staleness_secs")]
    OraclePriceStale,
    #[msg("Pyth price confidence interval exceeds RiskConfig.max_confidence_bps")]
    OracleConfidenceTooWide,
    #[msg("Price update account's feed_id does not match the market's asset_feed_id")]
    OracleFeedMismatch,
    #[msg("Pyth reported a negative price, which this protocol cannot price a market on")]
    NegativeOraclePrice,
    #[msg("Arithmetic overflow/underflow")]
    MathOverflow,
}
