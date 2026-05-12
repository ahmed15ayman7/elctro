import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  parseRefreshTokenFromResponse,
  setTokenCookies,
} from "@/lib/auth-cookies";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function GET(
  request: Request,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale } = await context.params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const toLogin = (reason: string) =>
    NextResponse.redirect(new URL(`/${locale}/auth/login?error=${encodeURIComponent(reason)}`, request.url));

  if (oauthError) {
    return toLogin("google_denied");
  }

  const jar = await cookies();
  const expected = jar.get("g_oauth_state")?.value;
  jar.delete("g_oauth_state");

  if (!code || !state || !expected || state !== expected) {
    return toLogin("oauth_state");
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!siteUrl) {
    return toLogin("site_url");
  }

  const redirectUri = `${siteUrl}/${locale}/auth/callback/google`;

  const res = await fetch(`${API_BASE}/api/auth/google/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUri }),
    cache: "no-store",
  });

  let data: { accessToken?: string; error?: string };
  try {
    data = await res.json();
  } catch {
    return toLogin("bad_response");
  }

  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error : "exchange_failed";
    return toLogin(msg);
  }

  const accessToken = data.accessToken;
  const refresh = parseRefreshTokenFromResponse(res);
  if (!accessToken || !refresh) {
    return toLogin("no_session");
  }

  await setTokenCookies(accessToken, refresh);

  return NextResponse.redirect(new URL(`${siteUrl}/${locale}/auth/oauth-done`, request.url));
}
