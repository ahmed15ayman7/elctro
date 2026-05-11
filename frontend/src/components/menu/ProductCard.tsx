"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart.store";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/actions/products.actions";
import { formatCurrency } from "@/lib/utils";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
              <span className="text-5xl">🍔</span>
            </div>
          )}
          <div className="absolute top-2 start-2">
            <Badge variant="default" className="text-xs">
              {product.category.nameAr && locale === "ar"
                ? product.category.nameAr
                : product.category.name}
            </Badge>
          </div>
        </div>

        <CardContent className="flex flex-col gap-3 p-4 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold leading-tight line-clamp-1">{displayName}</h3>
              {displayDesc && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{displayDesc}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(parseFloat(product.price), locale)}
            </span>
            <Button size="sm" onClick={handleAdd} className="gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              {t("add_to_cart")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
