import "server-only";
import { PublicKey } from "@solana/web3.js";

/**
 * `Market.assetFeedId` is stored on-chain as a `pubkey` (32 raw bytes), doubling as the Pyth
 * Feed ID — see `programs/resolution/src/instructions/resolve_market.rs`. This maps that back
 * to a human asset symbol for the API response.
 *
 * Source of truth: `config/pyth-feeds.json` at the repo root (devnet feed IDs, hex-encoded).
 * Kept as a small hardcoded map here — rather than reading that file across the `app/`
 * package boundary — since it only has 3 entries and changes rarely; re-sync by hand if
 * `config/pyth-feeds.json` is ever regenerated.
 */
const FEED_ID_TO_SYMBOL: Record<string, "BTC" | "ETH" | "SOL"> = {
  e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43: "BTC",
  ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace: "ETH",
  ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d: "SOL",
};

export function symbolForFeedId(assetFeedId: PublicKey): "BTC" | "ETH" | "SOL" | null {
  const hex = assetFeedId.toBuffer().toString("hex");
  return FEED_ID_TO_SYMBOL[hex] ?? null;
}

/** The known symbols, in a stable order — used wherever "all 3 assets" needs enumerating. */
export const KNOWN_ASSET_SYMBOLS = ["BTC", "ETH", "SOL"] as const;

/** Inverse of `symbolForFeedId` — same source map, just the other direction. */
export function feedIdForSymbol(symbol: "BTC" | "ETH" | "SOL"): PublicKey {
  const hex = Object.entries(FEED_ID_TO_SYMBOL).find(([, s]) => s === symbol)![0];
  return new PublicKey(Buffer.from(hex, "hex"));
}
