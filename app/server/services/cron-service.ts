import "server-only";
import { listMarkets } from "@/server/services/market-service";
import { resolveMarket } from "@/server/services/resolve-service";

export type ResolveExpiredResult = {
  market: string;
  outcome: "resolved" | "skipped" | "failed";
  signature?: string;
  error?: string;
};

/**
 * Scans every market for "expired but still Active" and resolves each one. Meant to be called
 * on a schedule (Vercel Cron -> GET /api/cron/resolve-expired), not by end users — see the
 * auth check in the route handler. Failures for one market don't stop the rest (each is
 * independent — an unlucky RPC blip on one shouldn't block the others).
 */
export async function resolveExpiredMarkets(): Promise<ResolveExpiredResult[]> {
  const markets = await listMarkets();
  const nowSecs = Math.floor(Date.now() / 1000);
  const expired = markets.filter((m) => m.status === "active" && m.expiryTs <= nowSecs);

  const results: ResolveExpiredResult[] = [];
  for (const market of expired) {
    try {
      const { signature } = await resolveMarket(market.address);
      results.push({ market: market.address, outcome: "resolved", signature });
    } catch (error) {
      results.push({
        market: market.address,
        outcome: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}
