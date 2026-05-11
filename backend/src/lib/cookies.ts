import type { Response } from "express";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_PATH = "/api/auth";

/** Attach the refresh token as an HttpOnly, Secure cookie. */
export function setRefreshCookie(res: Response, token: string): void {
  const ttlMs =
    parseInt(process.env.REFRESH_TOKEN_TTL?.replace(/[^\d]/g, "") ?? "7") *
    (process.env.REFRESH_TOKEN_TTL?.endsWith("d") ? 86_400_000 : 3_600_000);

  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: REFRESH_PATH,
    maxAge: ttlMs,
  });
}

/** Clear the refresh token cookie. */
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: REFRESH_PATH,
  });
}

export { REFRESH_COOKIE };
