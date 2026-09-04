import "server-only";
import { PublicKey } from "@solana/web3.js";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { getConnection } from "@/server/solana/connection";
import { keypairWallet, loadKeeperKeypair } from "@/server/solana/anchor-keeper";

const HERMES_URL = "https://pyth.dourolabs.app/hermes";

/**
 * Pyth is a *pull* oracle (see CLAUDE.md) — devnet price update accounts don't refresh
 * themselves. A real keeper has to fetch a fresh signed update from Hermes (Pyth's off-chain
 * price service) and post it on-chain itself immediately before every `resolve_market` call;
 * relying on a previously-posted account (as `assets.ts`'s static `priceUpdateAccountForSymbol`
 * did) goes stale within `RiskConfig.max_staleness_secs` (60s) and `resolve_market` correctly
 * rejects it (`OraclePriceStale`) — confirmed by hand against devnet before this was written.
 *
 * Hermes now requires an API key (Pyth Core upgrade, Aug 2026) — see `PYTH_API_KEY` in
 * `.env.local`. Get one at Pyth Terminal; there's a free trial.
 */
async function fetchFreshPriceUpdateData(feedIdHex: string): Promise<string[]> {
  const apiKey = process.env.PYTH_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required environment variable: PYTH_API_KEY");
  }

  const url = `${HERMES_URL}/v2/updates/price/latest?ids[]=${feedIdHex}&encoding=base64`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Hermes request failed: ${response.status} ${await response.text()}`);
  }
  const body = (await response.json()) as { binary: { data: string[] } };
  return body.binary.data;
}

/**
 * Fetches a fresh price for `feedIdHex` (no `0x` prefix) from Hermes and posts it on-chain,
 * signed by the keeper wallet. Returns the address of the freshly-posted `PriceUpdateV2`
 * account — pass this straight into `resolve_market`'s `price_update` account.
 *
 * Leaves the posted account open (doesn't close it to reclaim rent) — the keeper wallet pays
 * a small amount of rent per call as a result. Acceptable for now given the keeper's balance
 * is expected to be small-but-topped-up rather than zero; closing it back up is a reasonable
 * follow-up, not required for correctness.
 */
export async function postFreshPriceUpdate(feedIdHex: string): Promise<PublicKey> {
  const priceUpdateData = await fetchFreshPriceUpdateData(feedIdHex);

  const keeper = loadKeeperKeypair();
  const receiver = new PythSolanaReceiver({
    connection: getConnection(),
    wallet: keypairWallet(keeper) as any, // same Wallet shape as anchor's, see anchor-keeper.ts
  });

  const builder = receiver.newTransactionBuilder({ closeUpdateAccounts: false });
  await builder.addPostPriceUpdates(priceUpdateData);

  const txs = await builder.buildVersionedTransactions({ computeUnitPriceMicroLamports: 50_000 });
  for (const { tx, signers } of txs) {
    tx.sign([keeper, ...signers]);
    const sig = await getConnection().sendTransaction(tx);
    const latest = await getConnection().getLatestBlockhash();
    await getConnection().confirmTransaction({ signature: sig, ...latest }, "confirmed");
  }

  // The SDK always keys its internal map with a "0x"-prefixed hex string (confirmed by
  // reading PythSolanaReceiver's source — buildPostPriceUpdateInstructions does
  // `"0x" + feedId.toString("hex")` regardless of the input format), even though our own
  // convention (assets.ts, market.assetFeedId) never carries the prefix — normalize here.
  return builder.getPriceUpdateAccount(`0x${feedIdHex}`);
}
