/**
 * Mirrors `Market` in `programs/market/src/state.rs`. Field names/shapes must
 * stay in sync with that struct — it's the source of truth, not this file.
 */

export type MarketStatus = "active" | "haltedForTrading" | "resolved";
export type MarketOutcome = "unresolved" | "down" | "up";

export type Market = {
  address: string;
  assetFeedId: string;
  assetSymbol: "BTC" | "ETH" | "SOL";
  strikePrice: string;
  expiryTs: number;
  downMint: string;
  upMint: string;
  collateralTokenAccount: string;
  totalCollateral: string;
  status: MarketStatus;
  outcome: MarketOutcome;
  resolvedPrice: string | null;
  resolvedAt: number | null;
};
