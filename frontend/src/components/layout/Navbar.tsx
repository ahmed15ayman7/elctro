"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ShoppingCart,
  User,
  Globe,
  LogOut,
  LayoutDashboard,
  Settings,
  Menu,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { logoutAction } from "@/actions/auth.actions";
import { toast } from "@/hooks/use-toast";
import UserAvatar from "@/components/common/UserAvatar";
import { ElctroLogoLockup } from "@/components/brand/ElctroLogo";
import { cn } from "@/lib/utils";

const navLinkClass =
  "font-medium text-muted-foreground transition-colors hover:text-foreground";
const mobileNavLinkClass =
  "flex w-full items-center rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  /** Derive count from `items` so Zustand re-renders when the cart changes (the `itemCount` fn ref is stable). */
  const cartItemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const { user, clearAuth } = useAuthStore();

  const otherLocale = locale === "en" ? "ar" : "en";

  async function handleLogout() {
    await logoutAction();
    clearAuth();
    toast({ title: t("logout"), description: "See you soon!" });
    setMobileNavOpen(false);
    window.location.assign(`/${locale}/`);
  }

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ElctroLogoLockup />
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-6 text-sm md:flex"
          aria-label={t("navigation_title")}
        >
          <Link href="/" className={navLinkClass}>
            {t("home")}
          </Link>
          <Link href="/menu" className={navLinkClass}>
            {t("menu")}
          </Link>
          <Link href="/about" className={navLinkClass}>
            {t("about_us")}
          </Link>
          {user && (
            <Link href="/orders" className={navLinkClass}>
              {t("orders")}
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className={navLinkClass}>
              {t("admin")}
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-navigation-dialog"
              aria-label={t("open_navigation")}
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <DialogContent
              id="mobile-navigation-dialog"
              className="flex max-h-[min(90dvh,640px)] w-[calc(100vw-1.25rem)] max-w-md flex-col gap-0 overflow-hidden p-0"
            >
              <DialogHeader className="shrink-0 border-b px-6 py-4">
                <DialogTitle>{t("navigation_title")}</DialogTitle>
              </DialogHeader>
              <nav
                className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-3"
                aria-label={t("navigation_title")}
              >
                <Link
                  href="/"
                  className={mobileNavLinkClass}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t("home")}
                </Link>
                <Link
                  href="/menu"
                  className={mobileNavLinkClass}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t("menu")}
                </Link>
                <Link
                  href="/about"
                  className={mobileNavLinkClass}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t("about_us")}
                </Link>
                {user && (
                  <Link
                    href="/orders"
                    className={mobileNavLinkClass}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {t("orders")}
                  </Link>
                )}
                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={mobileNavLinkClass}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {t("admin")}
                  </Link>
                )}

                {user && (
                  <>
                    <Separator className="my-2" />
                    <Link
                      href="/account/settings"
                      className={cn(mobileNavLinkClass, "gap-2")}
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <Settings className="h-5 w-5 shrink-0 text-muted-foreground" />
                      {t("account_settings")}
                    </Link>
                    <button
                      type="button"
                      className={cn(
                        mobileNavLinkClass,
                        "gap-2 text-start text-destructive hover:text-destructive"
                      )}
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 shrink-0" />
                      {t("logout")}
                    </button>
                  </>
                )}
              </nav>
            </DialogContent>
          </Dialog>

          {/* Language switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.replace("/", { locale: otherLocale })}
            className="gap-1.5 px-2 sm:px-3"
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">
              {otherLocale === "ar" ? "العربية" : "English"}
            </span>
          </Button>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative shrink-0">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <motion.span
                  key={cartItemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                >
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </motion.span>
              )}
            </Button>
          </Link>

          {/* Auth — desktop: full controls; mobile: avatar + login, heavy actions in sheet */}
          {user ? (
            <div className="flex items-center gap-1">
              <span className="flex" aria-label={t("signed_in_as", { name: user.name })}>
                <UserAvatar name={user.name} imageUrl={user.imageUrl} size="sm" />
              </span>
              <div className="hidden items-center gap-1 md:flex">
                <Link href="/account/settings">
                  <Button variant="ghost" size="icon" aria-label={t("account_settings")}>
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="icon" aria-label={t("admin")}>
                      <LayoutDashboard className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t("logout")}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="gap-1.5 px-2 sm:px-3" aria-label={t("login")}>
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{t("login")}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
