import { NextResponse } from "next/server";
import { buildRedeemTx } from "@/server/services/tx-service";
import { BadRequestError, toErrorResponse } from "@/server/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => {
      throw new BadRequestError("Request body must be JSON");
    });
    const { market, amount, wallet } = body as Record<string, unknown>;
    if (typeof market !== "string" || typeof amount !== "string" || typeof wallet !== "string") {
      throw new BadRequestError("Expected { market, amount, wallet } as strings");
    }

    const transaction = await buildRedeemTx(market, amount, wallet);
    return NextResponse.json({ transaction });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
