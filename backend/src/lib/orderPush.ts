import { prisma } from "./prisma.js";
import { isWebPushConfigured, sendPushToMany, type PushPayload } from "./webPush.js";

const frontendBase = () => (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");

function localePath(): string {
  const loc = (process.env.PUSH_NOTIFICATION_LOCALE ?? "en").replace(/^\//, "").replace(/\/$/, "");
  return loc === "ar" || loc === "en" ? loc : "en";
}

export async function notifyOrderCreatedForAdmins(order: {
  id: string;
  status: string;
  total: unknown;
}): Promise<void> {
  if (!isWebPushConfigured()) return;
  const subs = await prisma.pushSubscription.findMany({
    where: { user: { role: "ADMIN" } },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });
  if (subs.length === 0) return;
  const totalStr =
    typeof order.total === "object" && order.total !== null && "toString" in order.total
      ? String(order.total)
      : String(order.total);
  const payload: PushPayload = {
    type: "ORDER_CREATED",
    orderId: order.id,
    status: order.status,
    title: "New order",
    body: `Order ${order.id.slice(-8)} · total ${totalStr}`,
    url: `${frontendBase()}/${localePath()}/admin?tab=orders`,
  };
  await sendPushToMany(subs, payload);
}

export async function notifyOrderStatusToCustomer(order: {
  id: string;
  userId: string;
  status: string;
}): Promise<void> {
  if (!isWebPushConfigured()) return;
  const subs = await prisma.pushSubscription.findMany({
    where: { userId: order.userId },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });
  if (subs.length === 0) return;
  const payload: PushPayload = {
    type: "ORDER_UPDATED",
    orderId: order.id,
    status: order.status,
    title: "Order updated",
    body: `Your order is now: ${order.status}`,
    url: `${frontendBase()}/${localePath()}/orders`,
  };
  await sendPushToMany(subs, payload);
}
