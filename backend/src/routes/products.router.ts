import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticateAccess, requireAdmin } from "../middleware/authenticate.js";
import { NotFoundError } from "../lib/errors.js";
import { emitCatalogChanged } from "../socket.js";

const router = Router();

const productSchema = z.object({
  name: z.string().min(1).max(200),
  nameAr: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().cuid(),
});

// ─── GET /api/products (public) ───────────────────────────────────────────────

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, search } = req.query as Record<string, string>;
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { nameAr: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { category: { select: { id: true, name: true, nameAr: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/products/manage (admin — all products incl. inactive) ───────────
// Must be registered before `/:id` so "manage" is not parsed as an id.

router.get(
  "/manage",
  authenticateAccess,
  requireAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: { select: { id: true, name: true, nameAr: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(products);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/products/:id (public) ──────────────────────────────────────────

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!product) throw new NotFoundError("Product not found");
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// ─── Admin routes (protected) ─────────────────────────────────────────────────

router.post(
  "/",
  authenticateAccess,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = productSchema.parse(req.body);
      const product = await prisma.product.create({ data: { ...data, price: data.price } });
      emitCatalogChanged();
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  authenticateAccess,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = productSchema.partial().parse(req.body);
      const product = await prisma.product.update({
        where: { id: req.params.id },
        data,
      });
      emitCatalogChanged();
      res.json(product);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:id",
  authenticateAccess,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.product.delete({ where: { id: req.params.id } });
      emitCatalogChanged();
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
