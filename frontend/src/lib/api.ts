/**
 * Server-only API client (used from Server Actions).
 * When `accessToken` is omitted, attaches Bearer from HttpOnly `access_token` cookie.
 */

import { getAccessTokenFromCookies } from "@/lib/auth-cookies";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Explicit Bearer; if omitted, reads from Next.js cookies when on server. */
  accessToken?: string | null;
  /** Extra headers (e.g. Cookie for refresh against API). */
  headers?: Record<string, string>;
  /** If false, never sends Authorization (public routes). Default true. */
  attachAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    accessToken: explicitToken,
    headers = {},
    attachAuth = true,
  } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  let bearer = explicitToken;
  if (attachAuth && (bearer === undefined || bearer === null)) {
    bearer = await getAccessTokenFromCookies();
  }

  if (bearer) {
    requestHeaders["Authorization"] = `Bearer ${bearer}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      errorMessage = data.error ?? data.message ?? errorMessage;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, errorMessage);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
