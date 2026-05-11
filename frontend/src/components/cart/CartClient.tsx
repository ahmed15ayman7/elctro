"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/utils";

export default function CartClient() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 py-24 text-center"
      >
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">{t("empty")}</p>
        <Link href="/menu">
          <Button>{t("empty_cta")}</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {items.map((item) => {
            const name = locale === "ar" && item.nameAr ? item.nameAr : item.name;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-4 rounded-lg border bg-card p-4"
              >
                {/* Image */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">🍔</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.price, locale)}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Item total */}
                <p className="w-20 text-end font-semibold">
                  {formatCurrency(item.price * item.quantity, locale)}
                </p>

                {/* Remove */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Separator className="my-6" />

      <div className="flex items-center justify-between text-lg font-semibold">
        <span>{t("subtotal")}</span>
        <span>{formatCurrency(total(), locale)}</span>
      </div>

      <div className="mt-6">
        <Link href="/checkout">
          <Button size="lg" className="w-full text-base">
            {t("checkout")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
