"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, MapPin, Package, Receipt, UtensilsCrossed } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth.store";
import { useOrderRealtime } from "@/components/providers/SocketProvider";
import { getOrdersAction, type Order } from "@/actions/orders.actions";
import EmptyOrdersIllustration from "@/components/orders/EmptyOrdersIllustration";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
> = {
  PENDING: "warning",
  CONFIRMED: "default",
  PREPARING: "default",
  OUT_FOR_DELIVERY: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export default function OrdersClient() {
  const t = useTranslations("orders");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const { user } = useAuthStore();
  const { subscribeOrderUpdated } = useOrderRealtime();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getOrdersAction().then((res) => {
      if (res.data) setOrders(res.data);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return subscribeOrderUpdated(({ order }) => {
      setOrders((prev) => {
        const i = prev.findIndex((o) => o.id === order.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = order;
          return next;
        }
        if (order.userId === user.id) {
          return [order, ...prev];
        }
        return prev;
      });
    });
  }, [user, subscribeOrderUpdated]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-3xl border border-border/80 bg-card/80 px-8 py-14 text-center shadow-sm backdrop-blur-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Receipt className="h-8 w-8" aria-hidden />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{t("login_title")}</h2>
          <p className="text-sm text-muted-foreground">{t("login_subtitle")}</p>
        </div>
        <Link href="/auth/login">
          <Button size="lg" className="rounded-full px-8">
            {tNav("login")}
          </Button>
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
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
            <EmptyOrdersIllustration className="h-40 w-auto max-w-[min(100%,260px)] md:h-48" />
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Package className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t("empty_badge")}
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("empty_heading")}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("empty_subtitle")}
            </p>
            <Button asChild size="lg" className="mt-8 rounded-full px-10 shadow-md shadow-primary/25">
              <Link href="/menu" className="gap-2">
                <UtensilsCrossed className="h-4 w-4" aria-hidden />
                {t("browse_menu")}
              </Link>
            </Button>
            <p className="mt-5 max-w-sm text-xs leading-relaxed text-muted-foreground md:text-sm">{t("empty_footer")}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="text-center md:text-start">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Package className="h-3.5 w-3.5" aria-hidden />
          {t("badge")}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const shortId = order.id.slice(-8).toUpperCase();
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <Card
                  className={cn(
                    "overflow-hidden border-border/80 shadow-sm transition-shadow",
                    isExpanded && "ring-1 ring-primary/25 shadow-md"
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full flex-col gap-4 p-5 text-start md:flex-row md:items-center md:justify-between md:gap-6"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-mono text-xs text-muted-foreground">#{shortId}</p>
                      <p className="text-lg font-semibold tracking-tight">
                        {t("order_number", { id: shortId })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("placed_on")} · {formatDate(order.createdAt, locale)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                      <Badge variant={STATUS_VARIANTS[order.status] ?? "outline"} className="font-medium">
                        {t(`statuses.${order.status}`)}
                      </Badge>
                      <span className="text-lg font-bold tabular-nums text-primary">
                        {formatCurrency(parseFloat(order.total), locale)}
                      </span>
                      <span className="rounded-full border bg-muted/50 p-1.5 text-muted-foreground">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden border-t bg-muted/25"
                      >
                        <CardContent className="space-y-4 p-5 pt-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("items_heading")}
                          </p>
                          <ul className="space-y-3">
                            {order.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-start justify-between gap-4 text-sm"
                              >
                                <span className="min-w-0">
                                  <span className="font-medium text-foreground">{item.product.name}</span>
                                  <span className="text-muted-foreground"> × {item.quantity}</span>
                                </span>
                                <span className="shrink-0 tabular-nums font-medium">
                                  {formatCurrency(
                                    parseFloat(item.unitPrice) * item.quantity,
                                    locale
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {order.address && (
                            <>
                              <Separator />
                              <div className="flex gap-2 text-sm text-muted-foreground">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                <span>{order.address}</span>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
