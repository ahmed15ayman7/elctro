"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { Product } from "@/actions/products.actions";
import { formatCurrency } from "@/lib/utils";
import GuestCheckoutIllustration from "@/components/checkout/GuestCheckoutIllustration";

const AUTO_MS = 4500;

type Props = {
  products: Product[];
};

export default function CheckoutGuestGate({ products }: Props) {
  const t = useTranslations("checkout");
  const locale = useLocale();

  const slides = useMemo(() => {
    if (products.length > 0) return products;
    return [];
  }, [products]);

  const [index, setIndex] = useState(0);
  const len = slides.length;

  useEffect(() => {
    if (len <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [len]);

  const current = len > 0 ? slides[index] : null;
  const displayName =
    current && locale === "ar" && current.nameAr ? current.nameAr : current?.name ?? "";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-background to-muted/40 shadow-lg">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative grid gap-10 p-6 md:grid-cols-2 md:gap-12 md:p-10 lg:p-12">
        <div className="flex flex-col items-center text-center md:items-start md:text-start">
          <GuestCheckoutIllustration className="mx-auto h-44 w-auto max-w-[min(100%,280px)] md:mx-0 md:h-52" />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("guest_badge")}
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">{t("guest_title")}</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("guest_subtitle")}
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Button asChild size="lg" className="rounded-full px-8 shadow-md shadow-primary/25">
              <Link href="/auth/login">{t("guest_login")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary/30 px-8">
              <Link href="/auth/register">{t("guest_register")}</Link>
            </Button>
          </div>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-muted-foreground md:text-sm">
            {t("guest_footnote")}
          </p>
        </div>

        <div className="flex min-h-[280px] flex-col justify-center">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground md:text-start">
            {t("guest_carousel_hint")}
          </p>

          {len === 0 ? (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">{t("guest_empty_carousel")}</p>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/menu">{t("guest_browse_menu")}</Link>
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-inner">
                <AnimatePresence mode="wait">
                  {current && (
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      {current.imageUrl ? (
                        <Image
                          src={current.imageUrl}
                          alt={displayName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={index === 0}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-6xl dark:from-orange-950/40 dark:to-amber-950/30">
                          🍔
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                        <p className="line-clamp-2 text-lg font-semibold text-foreground drop-shadow-sm md:text-xl">
                          {displayName}
                        </p>
                        <p className="mt-1 text-sm font-bold tabular-nums text-primary">
                          {formatCurrency(parseFloat(current.price), locale)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                  aria-label={t("guest_prev")}
                  onClick={() => setIndex((i) => (i - 1 + len) % len)}
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </Button>
                <div className="flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={t("guest_go_slide", { n: i + 1 })}
                      aria-current={i === index}
                      onClick={() => setIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === index ? "w-7 bg-primary" : "w-2 bg-muted-foreground/35 hover:bg-muted-foreground/55"
                      }`}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                  aria-label={t("guest_next")}
                  onClick={() => setIndex((i) => (i + 1) % len)}
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
