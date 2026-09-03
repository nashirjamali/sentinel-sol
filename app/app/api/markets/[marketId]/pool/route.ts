import { NextResponse } from "next/server";
import { getPool } from "@/server/services/pool-service";
import { toErrorResponse } from "@/server/lib/errors";

// Same reasoning as app/api/markets/route.ts — on-chain state changes with every swap, so this
// must never be statically frozen at build time.
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { marketId: string } },
) {
  try {
    const pool = await getPool(params.marketId);
    return NextResponse.json({ pool });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
