import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 40;
const hits = new Map<string, { count: number; windowStart: number }>();

function rateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const row = hits.get(key);
  if (!row || now - row.windowStart > WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now });
    return false;
  }
  if (row.count >= MAX_REQUESTS) return true;
  row.count += 1;
  return false;
}

/**
 * Returns the access JWT for Socket.io `auth.token` (browser cannot read HttpOnly cookie).
 */
export async function GET(request: NextRequest) {
  if (isRateLimited(rateLimitKey(request))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ token });
}
