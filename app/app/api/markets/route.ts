import { NextResponse } from "next/server";
import { listMarkets } from "@/server/services/market-service";
import { toErrorResponse } from "@/server/lib/errors";

// Without this, Next.js statically renders this route once at build time (no dynamic APIs
// used in the handler) and serves that same frozen snapshot to everyone forever — wrong for
// on-chain data that changes (new markets, resolutions). Force a fresh fetch per request.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const markets = await listMarkets();
    return NextResponse.json({ markets });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
