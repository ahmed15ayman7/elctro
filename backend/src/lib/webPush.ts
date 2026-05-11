import webpush from "web-push";
import { prisma } from "./prisma.js";

export function getVapidPublicKey(): string | null {
  const k = process.env.VAPID_PUBLIC_KEY;
  return k && k.length > 0 ? k : null;
}

export function isWebPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_PUBLIC_KEY.length > 0 &&
      process.env.VAPID_PRIVATE_KEY.length > 0
  );
}

let vapidApplied = false;

function ensureVapidConfigured(): boolean {
  if (!isWebPushConfigured()) return false;
  if (vapidApplied) return true;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@localhost";
  webpush.setVapidDetails(
    subject,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  vapidApplied = true;
  return true;
}

export type PushPayload = {
  type: "ORDER_CREATED" | "ORDER_UPDATED";
  orderId: string;
  status?: string;
  title: string;
  body: string;
  url: string;
};

type StoredSub = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPushToSubscription(
  sub: StoredSub,
  payload: PushPayload
): Promise<void> {
  if (!ensureVapidConfigured()) return;
  const pushSub = {
    endpoint: sub.endpoint,
    keys: { p256dh: sub.p256dh, auth: sub.auth },
  };
  try {
    await webpush.sendNotification(pushSub, JSON.stringify(payload), {
      TTL: 3600,
    });
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    if (status === 404 || status === 410) {
      await prisma.pushSubscription.deleteMany({ where: { id: sub.id } }).catch(() => {});
    } else {
      console.warn("[web-push] send failed:", err);
    }
  }
}

export async function sendPushToMany(subs: StoredSub[], payload: PushPayload): Promise<void> {
  await Promise.allSettled(subs.map((s) => sendPushToSubscription(s, payload)));
}
