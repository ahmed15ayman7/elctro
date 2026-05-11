"use client";

import {
  FolderTree,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAdminLayout, type AdminTab } from "@/components/admin/AdminLayoutContext";

const NAV: { key: AdminTab; icon: typeof LayoutDashboard }[] = [
  { key: "overview", icon: LayoutDashboard },
  { key: "categories", icon: FolderTree },
  { key: "products", icon: Package },
  { key: "orders", icon: ShoppingBag },
  { key: "users", icon: Users },
];

export default function AdminSidebar() {
  const t = useTranslations("admin");
  const { tab, setTab } = useAdminLayout();

  const labels: Record<AdminTab, string> = {
    overview: t("dashboard"),
    categories: t("categories"),
    products: t("products"),
    orders: t("orders"),
    users: t("users"),
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-row gap-1.5 overflow-x-auto scroll-smooth border-b bg-card px-2 py-2.5 md:w-56 md:flex-col md:gap-1.5 md:overflow-y-auto md:border-b-0 md:border-e md:px-3 md:py-4",
        "snap-x snap-mandatory md:snap-none"
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
              "flex min-h-11 shrink-0 snap-start items-center gap-3 rounded-full px-3.5 py-2.5 text-start text-sm font-medium transition-colors md:min-h-0 md:py-2.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
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
