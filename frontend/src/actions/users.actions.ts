"use server";

import { apiRequest, ApiError } from "@/lib/api";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count?: { orders: number };
}

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getAdminUsersAction(): Promise<ActionResult<AdminUser[]>> {
  try {
    const users = await apiRequest<AdminUser[]>("/api/users");
    return { success: true, data: users };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to fetch users",
    };
  }
}

export async function updateUserRoleAction(
  userId: string,
  role: "CUSTOMER" | "ADMIN"
): Promise<ActionResult<AdminUser>> {
  try {
    const user = await apiRequest<AdminUser>(`/api/users/${userId}/role`, {
      method: "PATCH",
      body: { role },
    });
    return { success: true, data: user };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to update role",
    };
  }
}
