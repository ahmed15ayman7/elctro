"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { BarChart3, Package, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { useOrderRealtime } from "@/components/providers/SocketProvider";
import { useAdminLayout } from "@/components/admin/AdminLayoutContext";
import AdminCharts from "@/components/admin/AdminCharts";
import AdminProductCard from "@/components/admin/AdminProductCard";
import { getOrdersAction, updateOrderStatusAction, type Order } from "@/actions/orders.actions";
import {
  getAdminProductsAction,
  getCategoriesAction,
  createCategoryAction,
  createProductAction,
  deleteCategoryAction,
  deleteProductAction,
  type Category,
  type Product,
  type ProductCreateInput,
} from "@/actions/products.actions";
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { user } = useAuthStore();
  const { subscribeOrderUpdated } = useOrderRealtime();
  const { tab } = useAdminLayout();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const [catName, setCatName] = useState("");
  const [catNameAr, setCatNameAr] = useState("");
  const [catSlug, setCatSlug] = useState("");

  const [pName, setPName] = useState("");
  const [pNameAr, setPNameAr] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pDescAr, setPDescAr] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pImage, setPImage] = useState("");
  const [pCategoryId, setPCategoryId] = useState("");
  const [pActive, setPActive] = useState(true);

  async function reloadCatalog() {
    const [pRes, cRes] = await Promise.all([
      getAdminProductsAction(),
      getCategoriesAction(),
    ]);
    if (pRes.data) setProducts(pRes.data);
    if (cRes.data) setCategories(cRes.data);
  }

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      setLoading(false);
      return;
    }
    Promise.all([getOrdersAction(), getAdminProductsAction(), getCategoriesAction()]).then(
      ([ordersRes, productsRes, catRes]) => {
        if (ordersRes.data) setOrders(ordersRes.data);
        if (productsRes.data) setProducts(productsRes.data);
        if (catRes.data) setCategories(catRes.data);
        setLoading(false);
      }
    );
  }, [user]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    return subscribeOrderUpdated(({ order }) => {
      setOrders((prev) => {
        const i = prev.findIndex((o) => o.id === order.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = order;
          return next;
        }
        return [order, ...prev];
      });
    });
  }, [user?.role, subscribeOrderUpdated]);

  useEffect(() => {
    if (categories.length && !pCategoryId) {
      setPCategoryId(categories[0].id);
    }
  }, [categories, pCategoryId]);

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
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      key: "revenue",
      label: t("total_revenue"),
      value: formatCurrency(totalRevenue, locale),
      icon: BarChart3,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      key: "products",
      label: t("active_products"),
      value: products.filter((p) => p.isActive).length,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/40",
    },
  ];

  async function handleStatusChange(orderId: string, status: string) {
    const res = await updateOrderStatusAction(orderId, status);
    if (res.success && res.data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data! : o)));
      toast({ title: "Status updated" });
    } else {
      toast({ title: res.error ?? "Failed", variant: "destructive" });
    }
  }

  async function handleDeleteProduct(id: string) {
    const res = await deleteProductAction(id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Product deleted" });
    } else {
      toast({ title: res.error ?? "Failed", variant: "destructive" });
    }
  }

  function submitCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) {
      toast({ title: "Name and slug required", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      const res = await createCategoryAction({
        name: catName.trim(),
        slug: catSlug.trim(),
        ...(catNameAr.trim() ? { nameAr: catNameAr.trim() } : {}),
      });
      if (res.success && res.data) {
        setCategories((prev) => [res.data!, ...prev]);
        setCatName("");
        setCatNameAr("");
        setCatSlug("");
        toast({ title: "Category created" });
      } else {
        toast({ title: res.error ?? "Failed", variant: "destructive" });
      }
    });
  }

  function submitProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!pName.trim() || !pCategoryId) {
      toast({ title: "Name and category required", variant: "destructive" });
      return;
    }
    const price = parseFloat(pPrice);
    if (Number.isNaN(price) || price <= 0) {
      toast({ title: "Invalid price", variant: "destructive" });
      return;
    }
    const body: ProductCreateInput = {
      name: pName.trim(),
      price,
      categoryId: pCategoryId,
      isActive: pActive,
      ...(pNameAr.trim() ? { nameAr: pNameAr.trim() } : {}),
      ...(pDesc.trim() ? { description: pDesc.trim() } : {}),
      ...(pDescAr.trim() ? { descriptionAr: pDescAr.trim() } : {}),
    };
    if (pImage.trim()) {
      try {
        new URL(pImage.trim());
        body.imageUrl = pImage.trim();
      } catch {
        toast({ title: "Invalid image URL", variant: "destructive" });
        return;
      }
    }

    startTransition(async () => {
      const res = await createProductAction(body);
      if (res.success && res.data) {
        setProducts((prev) => [res.data!, ...prev]);
        setPName("");
        setPNameAr("");
        setPDesc("");
        setPDescAr("");
        setPPrice("");
        setPImage("");
        setPActive(true);
        toast({ title: "Product created" });
      } else {
        toast({ title: res.error ?? "Failed", variant: "destructive" });
      }
    });
  }

  async function handleDeleteCategory(id: string) {
    const res = await deleteCategoryAction(id);
    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (pCategoryId === id) setPCategoryId("");
      await reloadCatalog();
      toast({ title: "Category deleted" });
    } else {
      toast({ title: res.error ?? "Failed", variant: "destructive" });
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 pb-12">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Admin
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("catalog_title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {tab === "overview" && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {stats.map((stat) => (
              <Card key={stat.key} className="overflow-hidden border-primary/10 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
          <AdminCharts orders={orders} locale={locale} />
        </>
      )}

      {tab === "categories" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-5"
        >
          <Card className="border-primary/15 lg:col-span-2">
            <CardHeader className="space-y-1 border-b bg-gradient-to-br from-primary/8 to-transparent pb-4">
              <CardTitle className="text-lg">{t("create_category")}</CardTitle>
              <CardDescription>{t("create_category_hint")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={submitCategory} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">{t("category_name_en")}</Label>
                  <Input
                    id="cat-name"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Burgers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-name-ar">{t("category_name_ar")}</Label>
                  <Input
                    id="cat-name-ar"
                    value={catNameAr}
                    onChange={(e) => setCatNameAr(e.target.value)}
                    dir="rtl"
                    placeholder="اختياري"
                  />
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor="cat-slug">{t("slug")}</Label>
                    <Input
                      id="cat-slug"
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      placeholder="burgers"
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setCatSlug(slugify(catName))}
                  >
                    {t("generate_slug")}
                  </Button>
                </div>
                <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                  {pending ? t("creating") : t("save_category")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/80 lg:col-span-3">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">{t("category_list")}</CardTitle>
              <CardDescription>
                {categories.length === 0 ? t("no_categories") : `${categories.length} total`}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[480px] space-y-2 overflow-y-auto pt-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/50 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">{locale === "ar" && c.nameAr ? c.nameAr : c.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{c.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {t("products_count", { count: c._count?.products ?? 0 })}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteCategory(c.id)}
                    >
                      {t("delete_category")}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === "products" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-5"
        >
          <Card className="border-primary/15 lg:col-span-2 lg:sticky lg:top-20 lg:self-start">
            <CardHeader className="space-y-1 border-b bg-gradient-to-br from-amber-500/10 via-transparent to-primary/10 pb-4">
              <CardTitle className="text-lg">{t("create_product")}</CardTitle>
              <CardDescription>{t("image_optional")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("no_categories")}</p>
              ) : (
                <form onSubmit={submitProduct} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="p-cat">{t("select_category")}</Label>
                    <select
                      id="p-cat"
                      value={pCategoryId}
                      onChange={(e) => setPCategoryId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {locale === "ar" && c.nameAr ? c.nameAr : c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-name">{t("product_name_en")}</Label>
                    <Input
                      id="p-name"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-name-ar">{t("product_name_ar")}</Label>
                    <Input
                      id="p-name-ar"
                      value={pNameAr}
                      onChange={(e) => setPNameAr(e.target.value)}
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-desc">{t("description_en")}</Label>
                    <textarea
                      id="p-desc"
                      value={pDesc}
                      onChange={(e) => setPDesc(e.target.value)}
                      rows={2}
                      className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-desc-ar">{t("description_ar")}</Label>
                    <textarea
                      id="p-desc-ar"
                      value={pDescAr}
                      onChange={(e) => setPDescAr(e.target.value)}
                      rows={2}
                      dir="rtl"
                      className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p-price">{t("price")}</Label>
                      <Input
                        id="p-price"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0.01"
                        value={pPrice}
                        onChange={(e) => setPPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-img">{t("image_url")}</Label>
                      <Input
                        id="p-img"
                        type="url"
                        value={pImage}
                        onChange={(e) => setPImage(e.target.value)}
                        placeholder="https://…"
                      />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pActive}
                      onChange={(e) => setPActive(e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    {t("is_active")}
                  </label>
                  <Button type="submit" disabled={pending} className="w-full">
                    {pending ? t("creating") : t("save_product")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 lg:col-span-3">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">{t("product_list")}</CardTitle>
              <CardDescription>{products.length} items</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[720px] overflow-y-auto pt-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <div key={product.id} className="relative">
                    <AdminProductCard product={product} />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute end-2 top-2 z-10 h-9 w-9 shadow-md opacity-90 hover:opacity-100"
                      aria-label={t("delete_product")}
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === "orders" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{order.user?.name ?? "Guest"}</p>
                  <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt, locale)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(parseFloat(order.total), locale)}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}
