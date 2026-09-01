import "server-only";
import { NotFoundError } from "@/server/lib/errors";
import type { Market } from "@/server/types/market";

/**
 * STUB — `market_program` has no TypeScript SDK yet (blocked on
 * docs/product/planned/m6-typescript-sdk.md). Once the SDK exists, this
 * service should decode real `Market` accounts via `getConnection()` +
 * `PROGRAM_IDS.market` instead of returning fixtures.
 *
 * Route handlers only ever call this service, never `getConnection()`
 * directly, so swapping the fixture for real decoding later doesn't touch
 * `app/api/**`.
 */

const FIXTURE_MARKETS: Market[] = [
  {
    address: "8xw6oS9k6JngG8Z2h3nq1oWc5yq6yq6yq6yq6yq6yqA",
    assetFeedId: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b",
    assetSymbol: "BTC",
    strikePrice: "9741200000000",
    expiryTs: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
    downMint: "DownMint11111111111111111111111111111111",
    upMint: "UpMint111111111111111111111111111111111",
    collateralTokenAccount: "Vault1111111111111111111111111111111111",
    totalCollateral: "125000000000",
    status: "active",
    outcome: "unresolved",
    resolvedPrice: null,
    resolvedAt: null,
  },
  {
    address: "9yx7pT0l7KohH9A3i4or2pXd6zr7zr7zr7zr7zr7zrB",
    assetFeedId: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    assetSymbol: "ETH",
    strikePrice: "361400000000",
    expiryTs: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
    downMint: "DownMint22222222222222222222222222222222",
    upMint: "UpMint222222222222222222222222222222222",
    collateralTokenAccount: "Vault2222222222222222222222222222222222",
    totalCollateral: "84000000000",
    status: "active",
    outcome: "unresolved",
    resolvedPrice: null,
    resolvedAt: null,
  },
];

export async function listMarkets(): Promise<Market[]> {
  return FIXTURE_MARKETS;
}

export async function getMarket(address: string): Promise<Market> {
  const market = FIXTURE_MARKETS.find((m) => m.address === address);
  if (!market) {
    throw new NotFoundError(`No market at address ${address}`);
  }
  return market;
}
