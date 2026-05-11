"use client";

import {
  FolderTree,
  LayoutDashboard,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAdminLayout, type AdminTab } from "@/components/admin/AdminLayoutContext";

const NAV: { key: AdminTab; icon: typeof LayoutDashboard }[] = [
  { key: "overview", icon: LayoutDashboard },
  { key: "categories", icon: FolderTree },
  { key: "products", icon: Package },
  { key: "orders", icon: ShoppingBag },
];

export default function AdminSidebar() {
  const t = useTranslations("admin");
  const { tab, setTab } = useAdminLayout();

  const labels: Record<AdminTab, string> = {
    overview: t("dashboard"),
    categories: t("categories"),
    products: t("products"),
    orders: t("orders"),
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-row gap-1 overflow-x-auto border-b bg-card p-2 md:w-56 md:flex-col md:gap-1 md:border-b-0 md:border-e md:p-3"
      )}
      aria-label={t("shell_nav")}
    >
      {NAV.map(({ key, icon: Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-start text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            {labels[key]}
          </button>
        );
      })}
    </aside>
  );
}
