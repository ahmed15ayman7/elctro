"use server";

import { cookies } from "next/headers";
import { apiRequest, ApiError } from "@/lib/api";
import { z } from "zod";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

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

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  formData: FormData
): Promise<ActionResult<AuthResponse>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    // The backend sets the HttpOnly refresh cookie in its Set-Cookie response.
    // We forward that cookie to the client via Next.js response cookies.
    const result = await apiRequest<AuthResponse & { refreshToken?: string }>(
      "/api/auth/login",
      { method: "POST", body: parsed.data }
    );

    return { success: true, data: { user: result.user, accessToken: result.accessToken } };
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Login failed";
    return { success: false, error: message };
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(
  formData: FormData
): Promise<ActionResult<AuthResponse>> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const result = await apiRequest<AuthResponse>(
      "/api/auth/register",
      { method: "POST", body: parsed.data }
    );

    return { success: true, data: { user: result.user, accessToken: result.accessToken } };
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Registration failed";
    return { success: false, error: message };
  }
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function refreshAction(): Promise<ActionResult<AuthResponse>> {
  try {
    // Refresh token arrives as an HttpOnly cookie; next/headers lets us forward it.
    const cookieStore = await cookies();
    const refreshCookie = cookieStore.get("refresh_token");

    if (!refreshCookie) {
      return { success: false, error: "No session" };
    }

    const result = await apiRequest<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshCookie.value}` },
    });

    return { success: true, data: result };
  } catch {
    return { success: false, error: "Session expired" };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const refreshCookie = cookieStore.get("refresh_token");

    if (refreshCookie) {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshCookie.value}` },
      });
    }

    cookieStore.delete("refresh_token");
    return { success: true };
  } catch {
    return { success: false, error: "Logout failed" };
  }
}
