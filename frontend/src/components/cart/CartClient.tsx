"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, Sparkles, UtensilsCrossed } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/utils";
import EmptyCartIllustration from "@/components/cart/EmptyCartIllustration";

export default function CartClient() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-background to-muted/40 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/12 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-orange-400/10 blur-3xl"
            aria-hidden
          />

          <div className="relative flex flex-col items-center px-6 py-12 text-center md:px-10 md:py-14">
            <EmptyCartIllustration className="h-40 w-auto max-w-[min(100%,260px)] md:h-48" />
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t("empty_badge")}
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("empty_heading")}</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">{t("empty_subtitle")}</p>
            <Button asChild size="lg" className="mt-8 rounded-full px-10 shadow-md shadow-primary/25">
              <Link href="/menu" className="gap-2">
                <UtensilsCrossed className="h-4 w-4" aria-hidden />
                {t("empty_cta")}
              </Link>
            </Button>
            <p className="mt-5 max-w-sm text-xs leading-relaxed text-muted-foreground md:text-sm">{t("empty_footer")}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("summary_hint")}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full border-primary/25">
          <Link href="/menu">{t("empty_cta")}</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {items.map((item) => {
            const name = locale === "ar" && item.nameAr ? item.nameAr : item.name;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]"
              >
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-muted">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🍔</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.price, locale)}</p>
                </div>

                <div className="flex items-center gap-1 rounded-full border bg-background/80 p-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={t("quantity_decrease")}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="min-w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label={t("quantity_increase")}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <p className="hidden w-24 text-end text-sm font-bold tabular-nums sm:block">
                  {formatCurrency(item.price * item.quantity, locale)}
                </p>

                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                  aria-label={t("remove")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Separator className="my-8" />

      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-muted/30 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t("subtotal")}</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">{formatCurrency(total(), locale)}</p>
        </div>
        <Link href="/checkout" className="md:shrink-0">
          <Button size="lg" className="w-full rounded-full px-8 md:w-auto">
            {t("checkout")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
