import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  authenticateAccess,
  requireAdmin,
  type AuthenticatedRequest,
} from "../middleware/authenticate.js";
import { ConflictError, NotFoundError } from "../lib/errors.js";

const router = Router();

const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

// ─── GET /api/users/me ────────────────────────────────────────────────────────

router.get(
  "/me",
  authenticateAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: userPublicSelect,
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
          ...userPublicSelect,
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

// ─── GET /api/users/:id (admin only) ───────────────────────────────────────────

router.get(
  "/:id",
  authenticateAccess,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          ...userPublicSelect,
          updatedAt: true,
          _count: { select: { orders: true } },
        },
      });
      if (!user) throw new NotFoundError("User not found");
      res.json(user);
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
      const admin = (req as AuthenticatedRequest).user;
      const { role } = z
        .object({ role: z.enum(["CUSTOMER", "ADMIN"]) })
        .parse(req.body);

      if (role === "CUSTOMER" && req.params.id === admin.id) {
        throw new ConflictError("You cannot demote yourself");
      }

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
        select: userPublicSelect,
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/users/:id/promote-to-admin (admin only) ─────────────────────────

router.post(
  "/:id/promote-to-admin",
  authenticateAccess,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: userPublicSelect,
      });
      if (!existing) throw new NotFoundError("User not found");

      if (existing.role === "ADMIN") {
        res.json(existing);
        return;
      }

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role: "ADMIN" },
        select: userPublicSelect,
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/users/:id/demote-from-admin (admin only) ────────────────────────

router.post(
  "/:id/demote-from-admin",
  authenticateAccess,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = (req as AuthenticatedRequest).user;
      if (req.params.id === admin.id) {
        throw new ConflictError("You cannot demote yourself");
      }

      const existing = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: userPublicSelect,
      });
      if (!existing) throw new NotFoundError("User not found");

      if (existing.role === "CUSTOMER") {
        res.json(existing);
        return;
      }

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role: "CUSTOMER" },
        select: userPublicSelect,
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
