/**
 * Thin API client used exclusively from Server Actions (server-side only).
 * Access tokens are passed via Authorization header; refresh tokens travel
 * as HttpOnly cookies via `credentials: 'include'` (handled by Next.js).
 */

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

interface RequestOptions {
  method?: string;
  body?: unknown;
  accessToken?: string;
  headers?: Record<string, string>;
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
  const { method = "GET", body, accessToken, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (accessToken) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
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
