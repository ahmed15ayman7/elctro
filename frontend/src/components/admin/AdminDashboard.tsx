"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth.store";
import { useOrderRealtime } from "@/components/providers/SocketProvider";
import { useAdminLayout } from "@/components/admin/AdminLayoutContext";
import AdminCharts from "@/components/admin/AdminCharts";
import AdminCreateProductDialog from "@/components/admin/AdminCreateProductDialog";
import AdminOverviewQuickActions from "@/components/admin/AdminOverviewQuickActions";
import AdminOrderCard from "@/components/admin/AdminOrderCard";
import AdminProductCard from "@/components/admin/AdminProductCard";
import AdminUsersPanel from "@/components/admin/AdminUsersPanel";
import { getOrdersAction, updateOrderStatusAction, type Order } from "@/actions/orders.actions";
import {
  getAdminProductsAction,
  getCategoriesAction,
  createCategoryAction,
  deleteCategoryAction,
  deleteProductAction,
  type Category,
  type Product,
} from "@/actions/products.actions";
import { getAdminUsersAction, type AdminUser } from "@/actions/users.actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { AdminTab } from "@/components/admin/AdminLayoutContext";

const ADMIN_ORDER_STATUS_FILTERS = [
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
  const tOrderStatus = useTranslations("orders.statuses");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { subscribeOrderUpdated } = useOrderRealtime();
  const { tab, setTab } = useAdminLayout();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const [catName, setCatName] = useState("");
  const [catNameAr, setCatNameAr] = useState("");
  const [catSlug, setCatSlug] = useState("");

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

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
    Promise.all([
      getOrdersAction(),
      getAdminProductsAction(),
      getCategoriesAction(),
      getAdminUsersAction(),
    ]).then(([ordersRes, productsRes, catRes, usersRes]) => {
      if (ordersRes.data) setOrders(ordersRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (usersRes.data) setAdminUsers(usersRes.data);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    const raw = searchParams.get("tab");
    const allowed: AdminTab[] = ["overview", "categories", "products", "orders", "users"];
    if (raw && allowed.includes(raw as AdminTab)) {
      setTab(raw as AdminTab);
    }
  }, [searchParams, setTab]);

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

  const pageHeader = {
    overview: { title: t("page_title_overview"), desc: t("page_desc_overview") },
    categories: { title: t("page_title_categories"), desc: t("page_desc_categories") },
    products: { title: t("page_title_products"), desc: t("page_desc_products") },
    orders: { title: t("page_title_orders"), desc: t("page_desc_orders") },
    users: { title: t("page_title_users"), desc: t("page_desc_users") },
  }[tab];

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    let list = sortedOrders;
    const q = orderSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const idHit = o.id.toLowerCase().includes(q) || o.id.slice(-8).toLowerCase().includes(q);
        const nameHit = o.user?.name?.toLowerCase().includes(q);
        const emailHit = o.user?.email?.toLowerCase().includes(q);
        const phoneHit = o.phone?.toLowerCase().includes(q);
        const itemHit = o.items.some((i) => i.product.name.toLowerCase().includes(q));
        return Boolean(idHit || nameHit || emailHit || phoneHit || itemHit);
      });
    }
    if (orderStatusFilter !== "all") {
      list = list.filter((o) => o.status === orderStatusFilter);
    }
    return list;
  }, [sortedOrders, orderSearch, orderStatusFilter]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.nameAr && p.nameAr.toLowerCase().includes(q)) ||
        p.category.name.toLowerCase().includes(q) ||
        (p.category.nameAr && p.category.nameAr.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.descriptionAr && p.descriptionAr.toLowerCase().includes(q))
    );
  }, [products, productSearch]);

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

  const pipelineCount = orders.filter((o) =>
    ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(o.status)
  ).length;

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
    {
      key: "pipeline",
      label: t("overview_pipeline"),
      value: pipelineCount,
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      key: "users",
      label: t("overview_user_accounts"),
      value: adminUsers.length,
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/40",
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

  async function handleDeleteCategory(id: string) {
    const res = await deleteCategoryAction(id);
    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      await reloadCatalog();
      toast({ title: "Category deleted" });
    } else {
      toast({ title: res.error ?? "Failed", variant: "destructive" });
    }
  }

  function handleQuickAddProduct() {
    if (categories.length === 0) {
      toast({
        title: t("no_categories"),
        description: t("qa_create_category_first"),
        variant: "destructive",
      });
      setTab("categories");
      return;
    }
    setProductDialogOpen(true);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 pb-12">
      <AdminCreateProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        categories={categories}
        onCreated={(p) => setProducts((prev) => [p, ...prev])}
      />
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Admin
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{pageHeader.title}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{pageHeader.desc}</p>
        </div>
      </div>

      {tab === "overview" && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminOverviewQuickActions
              onNavigate={setTab}
              onAddProduct={handleQuickAddProduct}
              categoriesEmpty={categories.length === 0}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {stats.map((stat) => (
              <Card
                key={stat.key}
                className="overflow-hidden border-border/70 bg-gradient-to-br from-card to-muted/20 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} aria-hidden />
                  </div>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <p className="text-2xl font-bold tabular-nums tracking-tight">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            <AdminCharts orders={orders} locale={locale} />
          </motion.div>
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
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={t("product_search_placeholder")}
                  className="ps-9"
                  aria-label={t("product_search_placeholder")}
                />
              </div>
              <Button
                type="button"
                onClick={() => setProductDialogOpen(true)}
                className="shrink-0 gap-2 rounded-full px-6"
                disabled={categories.length === 0}
              >
                <Plus className="h-4 w-4" aria-hidden />
                {t("product_add_button")}
              </Button>
            </div>

            <Card className="border-border/80">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">{t("product_list")}</CardTitle>
                <CardDescription>
                  {t("product_list_count", {
                    shown: filteredProducts.length,
                    total: products.length,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[720px] overflow-y-auto pt-4">
                {filteredProducts.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">{t("product_search_empty")}</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
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
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {tab === "orders" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-4xl flex-col gap-6"
        >
          {sortedOrders.length === 0 ? (
            <Card className="border-dashed border-primary/20 bg-muted/20">
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShoppingBag className="h-7 w-7" aria-hidden />
                </div>
                <p className="text-lg font-semibold">{t("orders_empty_title")}</p>
                <p className="max-w-md text-sm text-muted-foreground">{t("orders_empty_desc")}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="relative min-h-10 w-full min-w-0 flex-1 sm:max-w-md">
                  <Search
                    className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder={t("orders_search_placeholder")}
                    className="ps-9"
                    aria-label={t("orders_search_placeholder")}
                  />
                </div>
                <div className="flex w-full flex-col gap-1 sm:w-auto sm:min-w-[200px]">
                  <Label htmlFor="admin-order-status-filter" className="text-xs font-medium text-muted-foreground">
                    {t("orders_filter_label")}
                  </Label>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger id="admin-order-status-filter" className="h-10 w-full sm:w-[220px]">
                      <SelectValue placeholder={t("orders_filter_label")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("orders_filter_all")}</SelectItem>
                      {ADMIN_ORDER_STATUS_FILTERS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {tOrderStatus(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {filteredOrders.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    {t("orders_search_empty")}
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <AdminOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))
              )}
            </>
          )}
        </motion.div>
      )}

      {tab === "users" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <AdminUsersPanel
            users={adminUsers}
            onUserUpdated={(u) =>
              setAdminUsers((prev) =>
                prev.map((x) => (x.id === u.id ? { ...x, ...u, _count: x._count } : x))
              )
            }
          />
        </motion.div>
      )}
    </div>
  );
}
