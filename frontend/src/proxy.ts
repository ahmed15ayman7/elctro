import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const initMiddleware = createMiddleware(routing);
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Static files & Next.js internals — skip immediately
  if (
    pathname.startsWith("/_next") ||
    /\.(png|jpe?g|svg|ico|webp|woff2?|css|js\.map)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. API routes ────────────────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  return initMiddleware(req);
}
export const config = {
  matcher: [
    // Skip API routes, Next internals, static files — otherwise `/api/*` becomes `/en/api/*`.
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
