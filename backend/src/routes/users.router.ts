import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  authenticateAccess,
  requireAdmin,
  type AuthenticatedRequest,
} from "../middleware/authenticate.js";
import { NotFoundError } from "../lib/errors.js";

const router = Router();

// ─── GET /api/users/me ────────────────────────────────────────────────────────

router.get(
  "/me",
  authenticateAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      if (!user) throw new NotFoundError("User not found");
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/users (admin only) ─────────────────────────────────────────────

router.get(
  "/",
  authenticateAccess,
  requireAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
);

// ─── PATCH /api/users/:id/role (admin only) ───────────────────────────────────

router.patch(
  "/:id/role",
  authenticateAccess,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = z.object({ role: z.enum(["CUSTOMER", "ADMIN"]) }).parse(req.body);
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
        select: { id: true, email: true, name: true, role: true },
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
