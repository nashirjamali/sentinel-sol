import type { MarketOutcome, MarketStatus } from "@/server/types/market";

/**
 * A wallet's balances for one market — not a distinct on-chain account itself, just the
 * token balances of the ATAs the protocol's mints define (`down_mint`/`up_mint`/pool `lp_mint`
 * — see `programs/market/src/state.rs` and `programs/amm/src/state.rs`).
 *
 * `marketStatus`/`marketOutcome`/`resolvedPrice` are copied in from the `Market` this position
 * belongs to — deliberately, so a frontend can decide "show a Redeem button, and for which
 * side" from this response alone, instead of making a second `GET /markets/:id` call per
 * position just to answer that.
 */
export type Position = {
  market: string;
  assetSymbol: "BTC" | "ETH" | "SOL" | "UNKNOWN";
  downBalance: string;
  upBalance: string;
  lpBalance: string;
  marketStatus: MarketStatus;
  marketOutcome: MarketOutcome;
  resolvedPrice: string | null;
};
