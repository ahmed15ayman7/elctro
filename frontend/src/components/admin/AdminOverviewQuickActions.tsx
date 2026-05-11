"use client";

import {
  FolderTree,
  Package,
  Plus,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { AdminTab } from "@/components/admin/AdminLayoutContext";

type Props = {
  onNavigate: (tab: AdminTab) => void;
  onAddProduct: () => void;
  categoriesEmpty: boolean;
};

const actionBase =
  "group flex flex-col items-start gap-2 rounded-xl border border-border/70 bg-card p-4 text-start shadow-sm transition-all hover:border-primary/35 hover:bg-primary/[0.04] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function AdminOverviewQuickActions({
  onNavigate,
  onAddProduct,
  categoriesEmpty,
}: Props) {
  const t = useTranslations("admin");

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-1 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
      <div className="border-b border-border/50 bg-gradient-to-r from-primary/[0.07] to-transparent px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t("overview_quick_actions")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("overview_quick_actions_desc")}</p>
      </div>
      <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <button type="button" className={cn(actionBase)} onClick={() => onNavigate("orders")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <ShoppingBag className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-semibold leading-tight text-foreground">{t("qa_orders")}</span>
          <span className="text-xs text-muted-foreground">{t("qa_orders_hint")}</span>
        </button>

        <button type="button" className={cn(actionBase)} onClick={onAddProduct}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Plus className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-semibold leading-tight text-foreground">{t("qa_add_product")}</span>
          <span className="text-xs text-muted-foreground">
            {categoriesEmpty ? t("qa_add_product_need_category") : t("qa_add_product_hint")}
          </span>
        </button>

        <button type="button" className={cn(actionBase)} onClick={() => onNavigate("products")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
            <Package className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-semibold leading-tight text-foreground">{t("qa_products")}</span>
          <span className="text-xs text-muted-foreground">{t("qa_products_hint")}</span>
        </button>

        <button type="button" className={cn(actionBase)} onClick={() => onNavigate("categories")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-400">
            <FolderTree className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-semibold leading-tight text-foreground">{t("qa_categories")}</span>
          <span className="text-xs text-muted-foreground">{t("qa_categories_hint")}</span>
        </button>

        <button type="button" className={cn(actionBase)} onClick={() => onNavigate("users")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-semibold leading-tight text-foreground">{t("qa_users")}</span>
          <span className="text-xs text-muted-foreground">{t("qa_users_hint")}</span>
        </button>

        <Link
          href="/menu"
          className={cn(actionBase, "ring-offset-background")}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/15 text-slate-700 dark:text-slate-300">
            <Store className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-semibold leading-tight text-foreground">{t("qa_storefront")}</span>
          <span className="text-xs text-muted-foreground">{t("qa_storefront_hint")}</span>
        </Link>
      </div>
    </div>
  );
}
