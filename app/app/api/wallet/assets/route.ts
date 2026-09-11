import { NextResponse } from "next/server";
import { listWalletAssets } from "@/server/services/wallet-asset-service";
import { toErrorResponse } from "@/server/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    if (!owner) {
      return NextResponse.json({ error: "Missing owner" }, { status: 400 });
    }
    const cluster = searchParams.get("cluster") === "mainnet" ? "mainnet" : "devnet";
    const payload = await listWalletAssets(owner, cluster);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/wallet/assets", error);
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
