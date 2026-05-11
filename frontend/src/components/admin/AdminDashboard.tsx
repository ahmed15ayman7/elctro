"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Package, ShoppingBag, Users } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { getOrdersAction, updateOrderStatusAction, type Order } from "@/actions/orders.actions";
import { getProductsAction, deleteProductAction, type Product } from "@/actions/products.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { user, accessToken } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<"overview" | "orders" | "products">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || user?.role !== "ADMIN") return;
    Promise.all([
      getOrdersAction(accessToken),
      getProductsAction(),
    ]).then(([ordersRes, productsRes]) => {
      if (ordersRes.data) setOrders(ordersRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      setLoading(false);
    });
  }, [accessToken, user]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-muted-foreground">Admin access required.</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + parseFloat(o.total), 0);

  const stats = [
    {
      key: "orders",
      label: t("total_orders"),
      value: orders.length,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      key: "revenue",
      label: t("total_revenue"),
      value: formatCurrency(totalRevenue, locale),
      icon: BarChart3,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      key: "products",
      label: t("active_products"),
      value: products.filter((p) => p.isActive).length,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  async function handleStatusChange(orderId: string, status: string) {
    if (!accessToken) return;
    const res = await updateOrderStatusAction(orderId, status, accessToken);
    if (res.success && res.data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data! : o)));
      toast({ title: "Status updated" });
    } else {
      toast({ title: res.error ?? "Failed", variant: "destructive" });
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!accessToken) return;
    const res = await deleteProductAction(id, accessToken);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Product deleted" });
    } else {
      toast({ title: res.error ?? "Failed", variant: "destructive" });
    }
  }

  const tabs = [
    { key: "overview" as const, label: t("dashboard") },
    { key: "orders" as const, label: t("orders") },
    { key: "products" as const, label: t("products") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t("dashboard")}</h1>

      {/* Tab nav */}
      <div className="flex gap-1 rounded-lg border bg-muted p-1 w-fit">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === tb.key ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {stats.map((stat) => (
            <Card key={stat.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{order.user?.name ?? "Guest"}</p>
                  <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt, locale)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatCurrency(parseFloat(order.total), locale)}</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Products tab */}
      {tab === "products" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Link href="/admin/products/new">
              <Button size="sm">{t("add_product")}</Button>
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(product.price), locale)}
                    </span>
                    <Badge variant={product.isActive ? "success" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm">{t("edit_product")}</Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      {t("delete_product")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
