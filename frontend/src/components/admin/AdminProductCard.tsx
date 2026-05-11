"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Package } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Product } from "@/actions/products.actions";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
};

export default function AdminProductCard({ product }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const displayName = locale === "ar" && product.nameAr ? product.nameAr : product.name;
  const displayDesc =
    locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
  const catName =
    locale === "ar" && product.category.nameAr ? product.category.nameAr : product.category.name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/admin/products/${product.id}`}
        className={cn(
          "group block h-full rounded-2xl outline-none transition-shadow",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        <Card className="h-full overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md">
          <div className="relative aspect-[4/3] w-full bg-muted">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={displayName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                <Package className="h-14 w-14 text-muted-foreground/50" aria-hidden />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent p-3 pt-10">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs font-medium">
                  {catName}
                </Badge>
                <Badge variant={product.isActive ? "default" : "outline"} className="text-xs">
                  {product.isActive ? t("status_active") : t("status_inactive")}
                </Badge>
              </div>
            </div>
            <span className="absolute end-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <div className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight">
                {displayName}
              </h3>
              <span className="shrink-0 text-sm font-bold tabular-nums text-primary">
                {formatCurrency(parseFloat(product.price), locale)}
              </span>
            </div>
            {displayDesc ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{displayDesc}</p>
            ) : (
              <p className="text-sm italic text-muted-foreground/80">{t("no_description")}</p>
            )}
            <p className="text-xs font-medium text-primary/90">{t("view_product")}</p>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
