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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NAV: { key: AdminTab; icon: typeof LayoutDashboard }[] = [
  { key: "overview", icon: LayoutDashboard },
  { key: "categories", icon: FolderTree },
  { key: "products", icon: Package },
  { key: "orders", icon: ShoppingBag },
  { key: "users", icon: Users },
];

function navButtonClass(active: boolean, opts?: { mobileSheet?: boolean }) {
  return cn(
    "flex w-full items-center gap-3 text-start font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    opts?.mobileSheet
      ? "rounded-lg px-3 py-3 text-base"
      : "min-h-11 shrink-0 rounded-full px-3.5 py-2.5 text-sm md:min-h-0 md:w-full md:py-2.5",
    active
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
  );
}

export default function AdminSidebar() {
  const t = useTranslations("admin");
  const { tab, setTab, mobileSidebarOpen, setMobileSidebarOpen } = useAdminLayout();

  const labels: Record<AdminTab, string> = {
    overview: t("dashboard"),
    categories: t("categories"),
    products: t("products"),
    orders: t("orders"),
    users: t("users"),
  };

  return (
    <>
      <Dialog open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <DialogContent
          id="admin-mobile-nav-dialog"
          className="flex max-h-[min(90dvh,640px)] w-[calc(100vw-1.25rem)] max-w-md flex-col gap-0 overflow-hidden p-0"
        >
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle>{t("shell_nav")}</DialogTitle>
          </DialogHeader>
          <nav
            className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-3"
            aria-label={t("shell_nav")}
          >
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <ElctroLogo className="h-9 w-9 shrink-0 text-primary" />
              <span className="text-lg font-bold tracking-tight">Elctro</span>
            </Link>
            <p className="px-3 pb-1 text-[11px] leading-tight text-muted-foreground">
              {t("storefront")}
            </p>
            {NAV.map(({ key, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setTab(key);
                    setMobileSidebarOpen(false);
                  }}
                  className={navButtonClass(active, { mobileSheet: true })}
                >
                  <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                  {labels[key]}
                </button>
              );
            })}
          </nav>
        </DialogContent>
      </Dialog>

      <aside
        className="hidden w-56 shrink-0 flex-col gap-1.5 overflow-y-auto border-e bg-card px-3 py-4 md:flex"
        aria-label={t("shell_nav")}
      >
        <div className="flex w-full shrink-0 flex-col gap-1 border-b border-border pb-3">
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
              className={navButtonClass(active)}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              {labels[key]}
            </button>
          );
        })}
      </aside>
    </>
  );
}
