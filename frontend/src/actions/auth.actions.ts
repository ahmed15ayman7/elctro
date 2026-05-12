"use server";

import {
  clearTokenCookies,
  getRefreshTokenFromCookies,
  parseRefreshTokenFromResponse,
  setTokenCookies,
} from "@/lib/auth-cookies";
import { ApiError } from "@/lib/api";
import { z } from "zod";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  imageUrl?: string | null;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

/** Safe payload returned to the client (tokens stay in HttpOnly cookies). */
export type AuthClientPayload = { user: AuthUser };

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

async function postAuthJson(path: string, body: unknown): Promise<{
  response: Response;
  data: AuthResponse;
}> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let data: AuthResponse & { error?: string };
  try {
    data = await response.json();
  } catch {
    throw new ApiError(response.status, "Invalid response from server");
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      typeof data.error === "string" ? data.error : "Request failed"
    );
  }

  return { response, data };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  formData: FormData
): Promise<ActionResult<AuthClientPayload>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const { response, data } = await postAuthJson("/api/auth/login", parsed.data);
    const refresh = parseRefreshTokenFromResponse(response);
    if (!refresh) {
      return {
        success: false,
        error: "Login succeeded but refresh session could not be established",
      };
    }
    await setTokenCookies(data.accessToken, refresh);
    return { success: true, data: { user: data.user } };
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Login failed";
    return { success: false, error: message };
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(
  formData: FormData
): Promise<ActionResult<AuthClientPayload>> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const { response, data } = await postAuthJson("/api/auth/register", parsed.data);
    const refresh = parseRefreshTokenFromResponse(response);
    if (!refresh) {
      return {
        success: false,
        error: "Account created but refresh session could not be established",
      };
    }
    await setTokenCookies(data.accessToken, refresh);
    return { success: true, data: { user: data.user } };
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Registration failed";
    return { success: false, error: message };
  }
}

// ─── Google sign-in ───────────────────────────────────────────────────────────

const googleTokenSchema = z.string().min(1, "Invalid Google credential");

export async function googleLoginAction(
  idToken: string
): Promise<ActionResult<AuthClientPayload>> {
  const parsed = googleTokenSchema.safeParse(idToken);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const { response, data } = await postAuthJson("/api/auth/google", {
      idToken: parsed.data,
    });
    const refresh = parseRefreshTokenFromResponse(response);
    if (!refresh) {
      return {
        success: false,
        error: "Signed in but session could not be established",
      };
    }
    await setTokenCookies(data.accessToken, refresh);
    return { success: true, data: { user: data.user } };
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Google sign-in failed";
    return { success: false, error: message };
  }
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function refreshAction(): Promise<ActionResult<AuthClientPayload>> {
  try {
    const refreshToken = await getRefreshTokenFromCookies();
    if (!refreshToken) {
      return { success: false, error: "No session" };
    }

    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
      cache: "no-store",
    });

    let data: AuthResponse & { error?: string };
    try {
      data = await response.json();
    } catch {
      return { success: false, error: "Session expired" };
    }

    if (!response.ok) {
      await clearTokenCookies();
      return {
        success: false,
        error: typeof data.error === "string" ? data.error : "Session expired",
      };
    }

    const newRefresh = parseRefreshTokenFromResponse(response) ?? refreshToken;
    await setTokenCookies(data.accessToken, newRefresh);
    return { success: true, data: { user: data.user } };
  } catch {
    await clearTokenCookies();
    return { success: false, error: "Session expired" };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<ActionResult> {
  try {
    const refreshToken = await getRefreshTokenFromCookies();
    if (refreshToken) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
        cache: "no-store",
      }).catch(() => undefined);
    }
    await clearTokenCookies();
    return { success: true };
  } catch {
    await clearTokenCookies();
    return { success: false, error: "Logout failed" };
  }
}
