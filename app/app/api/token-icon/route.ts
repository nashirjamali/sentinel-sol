import { NextResponse } from "next/server";

const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return true;
  }
  if (host === "0.0.0.0" || host === "::1" || host === "[::1]") return true;
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;
  const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31)
  );
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");
  if (!src) {
    return NextResponse.json({ error: "Missing src" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "Invalid src" }, { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.has(target.protocol) || isBlockedHost(target.hostname)) {
    return NextResponse.json({ error: "Blocked src" }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      cache: "force-cache",
      headers: { Accept: "image/*", "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Icon unavailable" }, { status: 502 });
    }
    const contentType = upstream.headers.get("content-type") ?? "image/png";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 502 });
    }
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Icon unavailable" }, { status: 502 });
  }
}
