import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticateAccess, requireAdmin } from "../middleware/authenticate.js";
import { NotFoundError } from "../lib/errors.js";
import { emitCatalogChanged } from "../socket.js";

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  nameAr: z.string().max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
});

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { products: { where: { isActive: true } } },
    });
    if (!category) throw new NotFoundError("Category not found");
    res.json(category);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authenticateAccess,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = categorySchema.parse(req.body);
      const category = await prisma.category.create({ data });
      emitCatalogChanged();
      res.status(201).json(category);
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
      const data = categorySchema.partial().parse(req.body);
      const category = await prisma.category.update({
        where: { id: req.params.id },
        data,
      });
      emitCatalogChanged();
      res.json(category);
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
      await prisma.category.delete({ where: { id: req.params.id } });
      emitCatalogChanged();
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
