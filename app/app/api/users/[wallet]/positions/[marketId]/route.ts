import { NextResponse } from "next/server";
import { getPosition } from "@/server/services/position-service";
import { toErrorResponse } from "@/server/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ wallet: string; marketId: string }> },
) {
  try {
    const { wallet, marketId } = await params;
    const position = await getPosition(wallet, marketId);
    return NextResponse.json({ position });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
