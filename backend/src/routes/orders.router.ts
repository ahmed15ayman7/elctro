import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  authenticateAccess,
  requireAdmin,
  type AuthenticatedRequest,
} from "../middleware/authenticate.js";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";
import { emitOrderUpdated } from "../socket.js";

const router = Router();

const orderListInclude = {
  items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
  user: { select: { id: true, name: true, email: true } },
} as const;

const orderItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  paymentMethod: z.enum(["COD", "ONLINE_SIMULATED"]).default("COD"),
  address: z.string().min(5).max(500),
  notes: z.string().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

// ─── POST /api/orders (authenticated) ────────────────────────────────────────

router.post(
  "/",
  authenticateAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { items, paymentMethod, address, notes } =
        createOrderSchema.parse(req.body);

      // Fetch all products in one query
      const productIds = items.map((i) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      if (products.length !== productIds.length) {
        res.status(422).json({ error: "One or more products are unavailable" });
        return;
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      let total = 0;

      const orderItems = items.map((item) => {
        const product = productMap.get(item.productId)!;
        const unitPrice = Number(product.price);
        total += unitPrice * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
        };
      });

      const order = await prisma.order.create({
        data: {
          userId,
          paymentMethod,
          address,
          notes,
          total,
          items: { create: orderItems },
        },
        include: orderListInclude,
      });

      emitOrderUpdated(order as unknown as Record<string, unknown>);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/orders (own orders for customer, all for admin) ─────────────────

router.get(
  "/",
  authenticateAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: userId, role } = (req as AuthenticatedRequest).user;
      const orders = await prisma.order.findMany({
        where: role === "ADMIN" ? {} : { userId },
        include: orderListInclude,
        orderBy: { createdAt: "desc" },
      });
      res.json(orders);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────

router.get(
  "/:id",
  authenticateAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: userId, role } = (req as AuthenticatedRequest).user;
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      if (!order) throw new NotFoundError("Order not found");
      if (role !== "ADMIN" && order.userId !== userId) {
        throw new ForbiddenError("You do not have access to this order");
      }

      res.json(order);
    } catch (err) {
      next(err);
    }
  }
);

// ─── PATCH /api/orders/:id/status (admin only) ────────────────────────────────

router.patch(
  "/:id/status",
  authenticateAccess,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = updateStatusSchema.parse(req.body);
      await prisma.order.update({
        where: { id: req.params.id },
        data: { status },
      });
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: orderListInclude,
      });
      if (!order) throw new NotFoundError("Order not found");
      emitOrderUpdated(order as unknown as Record<string, unknown>);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
