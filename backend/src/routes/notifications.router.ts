import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  authenticateAccess,
  type AuthenticatedRequest,
} from "../middleware/authenticate.js";
import { getVapidPublicKey, isWebPushConfigured } from "../lib/webPush.js";

const router = Router();

const subscribeBodySchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
  userAgent: z.string().max(500).optional(),
});

// ─── GET /api/notifications/vapid-public-key (public; key is not secret) ─────

router.get("/vapid-public-key", (_req: Request, res: Response) => {
  const key = getVapidPublicKey();
  if (!key) {
    res.status(503).json({ error: "Push notifications are not configured" });
    return;
  }
  res.json({ publicKey: key });
});

// ─── POST /api/notifications/subscribe (authenticated) ───────────────────────

router.post(
  "/subscribe",
  authenticateAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isWebPushConfigured()) {
        res.status(503).json({ error: "Push notifications are not configured" });
        return;
      }
      const userId = (req as AuthenticatedRequest).user.id;
      const { subscription, userAgent } = subscribeBodySchema.parse(req.body);
      const { endpoint, keys } = subscription;

      await prisma.pushSubscription.upsert({
        where: { endpoint },
        create: {
          userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: userAgent ?? null,
        },
        update: {
          userId,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: userAgent ?? null,
        },
      });
      res.status(201).json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/notifications/subscribe (authenticated) ───────────────────────

router.delete(
  "/subscribe",
  authenticateAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { endpoint } = z.object({ endpoint: z.string().url() }).parse(req.body);
      await prisma.pushSubscription.deleteMany({
        where: { userId, endpoint },
      });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
