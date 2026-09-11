import { NextResponse } from "next/server";
import { resolveExpiredMarkets } from "@/server/services/cron-service";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron (or any external scheduler) hits this on a schedule — configure the schedule in
 * `vercel.json`'s `crons` array once this app is actually deployed to Vercel; nothing here
 * assumes Vercel specifically. Vercel signs its own cron requests with this exact header
 * (`Authorization: Bearer $CRON_SECRET`) — checking it stops randos on the internet from
 * spamming resolve attempts (harmless since resolve_market is idempotent-safe on-chain, but
 * still needless RPC/keeper-fee spend with zero auth at all).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured on this deployment" },
      { status: 500 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await resolveExpiredMarkets();
  return NextResponse.json({ results });
}
