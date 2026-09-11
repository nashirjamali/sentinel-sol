import { NextResponse } from "next/server";
import { buildProtectTx } from "@/server/services/tx-service";
import { BadRequestError, toErrorResponse } from "@/server/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => {
      throw new BadRequestError("Request body must be JSON");
    });
    const { market, amount, minDownOut, wallet } = body as Record<string, unknown>;
    if (
      typeof market !== "string" ||
      typeof amount !== "string" ||
      typeof minDownOut !== "string" ||
      typeof wallet !== "string"
    ) {
      throw new BadRequestError("Expected { market, amount, minDownOut, wallet } as strings");
    }

    const transaction = await buildProtectTx(market, amount, minDownOut, wallet);
    return NextResponse.json({ transaction });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
