import { NextResponse } from "next/server";
import { buildAddLiquidityTx } from "@/server/services/tx-service";
import { BadRequestError, toErrorResponse } from "@/server/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => {
      throw new BadRequestError("Request body must be JSON");
    });
    const { market, downAmount, upAmount, wallet } = body as Record<string, unknown>;
    if (
      typeof market !== "string" ||
      typeof downAmount !== "string" ||
      typeof upAmount !== "string" ||
      typeof wallet !== "string"
    ) {
      throw new BadRequestError("Expected { market, downAmount, upAmount, wallet } as strings");
    }

    const transaction = await buildAddLiquidityTx(market, downAmount, upAmount, wallet);
    return NextResponse.json({ transaction });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
