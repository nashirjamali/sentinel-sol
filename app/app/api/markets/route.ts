import { NextResponse } from "next/server";
import { listMarkets } from "@/server/services/market-service";
import { toErrorResponse } from "@/server/lib/errors";

export async function GET() {
  try {
    const markets = await listMarkets();
    return NextResponse.json({ markets });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
