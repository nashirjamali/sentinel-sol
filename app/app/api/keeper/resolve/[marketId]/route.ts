import { NextResponse } from "next/server";
import { resolveMarket } from "@/server/services/resolve-service";
import { toErrorResponse } from "@/server/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { marketId: string } },
) {
  try {
    const result = await resolveMarket(params.marketId);
    return NextResponse.json(result);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
