"use client";

import {
  FolderTree,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ElctroLogo } from "@/components/brand/ElctroLogo";
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
        "flex shrink-0 flex-row items-center gap-1.5 overflow-x-auto scroll-smooth border-b bg-card px-2 py-2.5 md:w-56 md:flex-col md:items-stretch md:gap-1.5 md:overflow-y-auto md:border-b-0 md:border-e md:px-3 md:py-4",
        "snap-x snap-mandatory md:snap-none"
      )}
      aria-label={t("shell_nav")}
    >
      <Link
        href="/"
        className="flex shrink-0 snap-start items-center justify-center rounded-full p-1 text-primary transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
        aria-label={t("storefront")}
      >
        <ElctroLogo className="h-8 w-8" />
      </Link>

      <div className="hidden w-full shrink-0 flex-col gap-1 border-b border-border pb-3 md:flex">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ElctroLogo className="h-9 w-9 shrink-0 text-primary" />
          <span className="text-lg font-bold tracking-tight">Elctro</span>
        </Link>
        <p className="px-2 text-[11px] leading-tight text-muted-foreground">{t("storefront")}</p>
      </div>

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
