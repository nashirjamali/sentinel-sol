/** Mirrors `GlobalConfig` in `programs/config/src/state.rs`. */
export type GlobalConfigView = {
  admin: string;
  pendingAdmin: string | null;
  paused: boolean;
};

/**
 * Mirrors `RiskConfig` in `programs/config/src/state.rs`, one per known asset (BTC/ETH/SOL).
 * `null` means no `RiskConfig` account exists on-chain yet for that asset (admin hasn't run
 * `upsert_risk_config`) — that's a valid, expected state, not an error.
 */
export type AssetRiskConfig = {
  symbol: "BTC" | "ETH" | "SOL";
  assetFeedId: string;
  maxStalenessSecs: number;
  maxConfidenceBps: number;
  tradingHaltSecs: number;
  lmsrBMin: string;
  enabled: boolean;
} | null;
