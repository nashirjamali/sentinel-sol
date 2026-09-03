import { NextResponse } from "next/server";
import { listPositions } from "@/server/services/position-service";
import { toErrorResponse } from "@/server/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { wallet: string } }) {
  try {
    const positions = await listPositions(params.wallet);
    return NextResponse.json({ positions });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
