import { NextResponse } from "next/server";
import { getMarket } from "@/server/services/market-service";
import { toErrorResponse } from "@/server/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ marketId: string }> },
) {
  try {
    const { marketId } = await params;
    const market = await getMarket(marketId);
    return NextResponse.json({ market });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
