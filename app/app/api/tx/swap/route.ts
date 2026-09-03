import { NextResponse } from "next/server";
import { buildSwapTx } from "@/server/services/tx-service";
import { BadRequestError, toErrorResponse } from "@/server/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => {
      throw new BadRequestError("Request body must be JSON");
    });
    const { market, sideIn, amountIn, minAmountOut, wallet } = body as Record<string, unknown>;
    if (
      typeof market !== "string" ||
      (sideIn !== "down" && sideIn !== "up") ||
      typeof amountIn !== "string" ||
      typeof minAmountOut !== "string" ||
      typeof wallet !== "string"
    ) {
      throw new BadRequestError(
        'Expected { market, sideIn: "down"|"up", amountIn, minAmountOut, wallet }',
      );
    }

    const transaction = await buildSwapTx(market, sideIn, amountIn, minAmountOut, wallet);
    return NextResponse.json({ transaction });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
