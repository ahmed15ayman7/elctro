import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPE = "openid email profile";

export async function GET(
  request: Request,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale } = await context.params;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  const fail = (code: string) =>
    NextResponse.redirect(new URL(`/${locale}/auth/login?error=${code}`, request.url));

  if (!clientId) {
    return fail("google_config");
  }
  if (!siteUrl) {
    return fail("site_url");
  }

  const redirectUri = `${siteUrl}/${locale}/auth/callback/google`;
  const state = crypto.randomUUID();

  const jar = await cookies();
  jar.set("g_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const url = new URL(GOOGLE_AUTH);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(url.toString());
}
