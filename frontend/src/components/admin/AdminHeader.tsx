"use client";

import { Globe, LogOut, Menu, Settings, Store } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { logoutAction } from "@/actions/auth.actions";
import { toast } from "@/hooks/use-toast";
import UserAvatar from "@/components/common/UserAvatar";
import { useAdminLayout } from "@/components/admin/AdminLayoutContext";

export default function AdminHeader() {
  const tNav = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { mobileSidebarOpen, setMobileSidebarOpen } = useAdminLayout();
  const otherLocale = locale === "en" ? "ar" : "en";

  async function handleLogout() {
    await logoutAction();
    clearAuth();
    toast({ title: tNav("logout"), description: "See you soon!" });
    window.location.assign(`/${locale}/`);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/90 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          aria-expanded={mobileSidebarOpen}
          aria-controls="admin-mobile-nav-dialog"
          aria-label={tAdmin("open_navigation")}
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link
          href="/"
          className="inline-flex min-w-0 shrink-0 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Store className="h-4 w-4 shrink-0" aria-hidden />
          <span className="sr-only sm:not-sr-only sm:inline">{tAdmin("storefront")}</span>
        </Link>
        {user ? (
          <div
            className="flex min-w-0 items-center gap-2 border-s border-border ps-2 sm:ps-3"
            aria-label={tNav("signed_in_as", { name: user.name })}
          >
            <UserAvatar name={user.name} imageUrl={user.imageUrl} size="sm" />
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-foreground sm:inline">
              {user.name}
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 px-2 sm:px-3">
          <Link href="/account/settings">
            <Settings className="h-4 w-4 shrink-0" aria-hidden />
            <span className="sr-only sm:not-sr-only sm:inline">{tNav("account_settings")}</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => router.replace("/admin", { locale: otherLocale })}
          className="gap-1.5 px-2 sm:px-3"
        >
          <Globe className="h-4 w-4 shrink-0" aria-hidden />
          <span className="sr-only sm:not-sr-only sm:inline">
            {otherLocale === "ar" ? "العربية" : "English"}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={handleLogout}
          className="gap-1.5 px-2 sm:px-3"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          <span className="sr-only sm:not-sr-only sm:inline">{tNav("logout")}</span>
        </Button>
      </div>
    </header>
  );
}
