"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import { getOrdersAction, type Order } from "@/actions/orders.actions";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  CONFIRMED: "default",
  PREPARING: "default",
  OUT_FOR_DELIVERY: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export default function OrdersClient() {
  const t = useTranslations("orders");
  const locale = useLocale();
  const { user } = useAuthStore();
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

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-muted-foreground">Please log in to view your orders.</p>
        <Link href="/auth/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <Package className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">{t("no_orders")}</p>
        <Link href="/menu">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold">
                          {t("order_number", { id: order.id.slice(-8).toUpperCase() })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt, locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={STATUS_VARIANTS[order.status] ?? "outline"}>
                          {t(`statuses.${order.status}`)}
                        </Badge>
                        <span className="font-semibold">
                          {formatCurrency(parseFloat(order.total), locale)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="flex flex-col gap-2 border-t pt-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.product.name} × {item.quantity}
                              </span>
                              <span>
                                {formatCurrency(
                                  parseFloat(item.unitPrice) * item.quantity,
                                  locale
                                )}
                              </span>
                            </div>
                          ))}
                          {order.address && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              📍 {order.address}
                            </p>
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
