"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ShoppingCart, User, Globe, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { logoutAction } from "@/actions/auth.actions";
import { toast } from "@/hooks/use-toast";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
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
    window.location.assign(`/${locale}/`);
  }

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold">Elctro</span>
        </Link>

        {/* Nav links — scroll on small screens */}
        <nav className="flex max-w-[55vw] items-center gap-4 overflow-x-auto whitespace-nowrap pr-1 text-sm sm:max-w-none md:gap-6">
          <Link
            href="/"
            className="font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("home")}
          </Link>
          <Link
            href="/menu"
            className="font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("menu")}
          </Link>
          <Link
            href="/about"
            className="font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("about_us")}
          </Link>
          {user && (
            <Link
              href="/orders"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("orders")}
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("admin")}
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.replace("/", { locale: otherLocale })}
            className="gap-1.5"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:block">{otherLocale === "ar" ? "العربية" : "English"}</span>
          </Button>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
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

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-1">
              <Link href="/account/settings">
                <Button variant="ghost" size="icon" aria-label={t("account_settings")}>
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="ghost" size="icon">
                    <LayoutDashboard className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="gap-1.5">
                <User className="h-4 w-4" />
                {t("login")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
