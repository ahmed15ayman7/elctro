import { cookies } from "next/headers";

/** HttpOnly cookie on the Next.js host — mirrors API access JWT. */
export const ACCESS_TOKEN_COOKIE = "access_token";

/** HttpOnly cookie on the Next.js host — mirrors API refresh JWT. */
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const DEFAULT_ACCESS_TTL = "15m";
const DEFAULT_REFRESH_TTL = "7d";

function ttlToSeconds(ttl: string): number {
  const m = ttl.trim().match(/^(\d+)([smhd])$/i);
  if (!m) return 900;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  const mult: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return n * (mult[u] ?? 60);
}

function cookieBaseOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
} {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
}

export function getAccessCookieMaxAge(): number {
  return ttlToSeconds(process.env.ACCESS_TOKEN_TTL ?? DEFAULT_ACCESS_TTL);
}

export function getRefreshCookieMaxAge(): number {
  return ttlToSeconds(process.env.REFRESH_TOKEN_TTL ?? DEFAULT_REFRESH_TTL);
}

/**
 * Extract `refresh_token` value from Fetch API `Set-Cookie` headers (Node/undici).
 */
export function parseRefreshTokenFromResponse(res: Response): string | null {
  const list =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [];

  for (const line of list) {
    const m = line.match(/^refresh_token=([^;]+)/);
    if (m?.[1]) return decodeURIComponent(m[1]);
  }

  const fallback = res.headers.get("set-cookie");
  if (fallback) {
    const parts = fallback.split(/,(?=[^;]+?=)/);
    for (const part of parts) {
      const m = part.trim().match(/^refresh_token=([^;]+)/);
      if (m?.[1]) return decodeURIComponent(m[1]);
    }
  }

  return null;
}

export async function getAccessTokenFromCookies(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshTokenFromCookies(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function setTokenCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const store = await cookies();
  const base = cookieBaseOptions();

  store.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...base,
    maxAge: getAccessCookieMaxAge(),
  });

  store.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...base,
    maxAge: getRefreshCookieMaxAge(),
  });
}

export async function clearTokenCookies(): Promise<void> {
  const store = await cookies();
  const base = cookieBaseOptions();

  store.set(ACCESS_TOKEN_COOKIE, "", { ...base, maxAge: 0 });
  store.set(REFRESH_TOKEN_COOKIE, "", { ...base, maxAge: 0 });
}
