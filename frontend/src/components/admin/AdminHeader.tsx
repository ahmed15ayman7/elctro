"use client";

import { Globe, LogOut, Settings, Store } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { logoutAction } from "@/actions/auth.actions";
import { toast } from "@/hooks/use-toast";

export default function AdminHeader() {
  const tNav = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const otherLocale = locale === "en" ? "ar" : "en";

  async function handleLogout() {
    await logoutAction();
    clearAuth();
    toast({ title: tNav("logout"), description: "See you soon!" });
    router.push("/");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
      >
        <Store className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{tAdmin("storefront")}</span>
      </Link>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/account/settings">
            <Settings className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{tNav("account_settings")}</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => router.replace("/admin", { locale: otherLocale })}
          className="gap-1.5"
        >
          <Globe className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">
            {otherLocale === "ar" ? "العربية" : "English"}
          </span>
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={handleLogout} className="gap-1.5">
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{tNav("logout")}</span>
        </Button>
      </div>
    </header>
  );
}
