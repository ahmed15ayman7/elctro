"use server";

import { apiRequest, ApiError } from "@/lib/api";

export type PushSubscriptionPayload = {
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };
  userAgent?: string;
};

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getVapidPublicKeyAction(): Promise<ActionResult<{ publicKey: string }>> {
  try {
    const data = await apiRequest<{ publicKey: string }>("/api/notifications/vapid-public-key", {
      attachAuth: false,
    });
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Push is not available",
    };
  }
}

export async function savePushSubscriptionAction(
  payload: PushSubscriptionPayload
): Promise<ActionResult> {
  try {
    await apiRequest("/api/notifications/subscribe", {
      method: "POST",
      body: payload,
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to save subscription",
    };
  }
}

export async function deletePushSubscriptionAction(endpoint: string): Promise<ActionResult> {
  try {
    await apiRequest("/api/notifications/subscribe", {
      method: "DELETE",
      body: { endpoint },
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "Failed to remove subscription",
    };
  }
}
