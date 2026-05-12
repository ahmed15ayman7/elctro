"use client";

import { useLayoutEffect, useEffect, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { AdminLayoutProvider } from "@/components/admin/AdminLayoutContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function ClientAdminLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setAuthReady(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setAuthReady(true));
    return unsub;
  }, []);

  useLayoutEffect(() => {
    if (!authReady) return;
    if (!user) {
      window.location.assign(`/${locale}/auth/login`);
      return;
    }
    if (user.role !== "ADMIN") {
      window.location.assign(`/${locale}/`);
    }
  }, [authReady, user, locale]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-muted/30 px-4 text-center text-sm text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p>Redirecting…</p>
      </div>
    );
  }

  return (
    <AdminLayoutProvider>
      <div className="flex min-h-screen flex-col bg-muted/20 md:flex-row">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-background md:bg-muted/10">
          <AdminHeader />
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </AdminLayoutProvider>
  );
}
