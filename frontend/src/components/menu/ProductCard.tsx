"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart.store";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/actions/products.actions";
import { formatCurrency, cn } from "@/lib/utils";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const t = useTranslations("menu");
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);

  const displayName = locale === "ar" && product.nameAr ? product.nameAr : product.name;
  const displayDesc =
    locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl,
    });
    toast({
      title: t("added"),
      description: t("item_added", { name: displayName }),
    });
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      className="group h-full"
    >
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm",
          "ring-1 ring-border/60 transition-shadow duration-200",
          "hover:shadow-md hover:ring-border"
        )}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/20"
              aria-hidden
            >
              <span className="text-5xl">🍔</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 transition-opacity duration-200 group-hover:opacity-95" />
          <div className="absolute start-3 top-3 z-[1]">
            <Badge variant="secondary" className="text-xs font-medium shadow-sm backdrop-blur-sm">
              {product.category.nameAr && locale === "ar"
                ? product.category.nameAr
                : product.category.name}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 pt-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold leading-snug tracking-tight line-clamp-2">
              {displayName}
            </h3>
            {displayDesc ? (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {displayDesc}
              </p>
            ) : null}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-1">
            <p className="text-lg font-bold tabular-nums tracking-tight text-primary">
              <span className="sr-only">{t("price_label")}</span>
              {formatCurrency(parseFloat(product.price), locale)}
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              className="shrink-0 gap-1.5 rounded-xl px-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t("add_to_cart")}
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
