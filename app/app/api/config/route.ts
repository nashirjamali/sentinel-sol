import { NextResponse } from "next/server";
import { getGlobalConfig } from "@/server/services/config-service";
import { toErrorResponse } from "@/server/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getGlobalConfig();
    return NextResponse.json({ config });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
