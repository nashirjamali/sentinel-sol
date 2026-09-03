import { NextResponse } from "next/server";
import { buildRemoveLiquidityTx } from "@/server/services/tx-service";
import { BadRequestError, toErrorResponse } from "@/server/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => {
      throw new BadRequestError("Request body must be JSON");
    });
    const { market, lpAmount, wallet } = body as Record<string, unknown>;
    if (typeof market !== "string" || typeof lpAmount !== "string" || typeof wallet !== "string") {
      throw new BadRequestError("Expected { market, lpAmount, wallet } as strings");
    }

    const transaction = await buildRemoveLiquidityTx(market, lpAmount, wallet);
    return NextResponse.json({ transaction });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
