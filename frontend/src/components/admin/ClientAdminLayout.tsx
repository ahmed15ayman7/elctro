"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/store/auth.store";
import { AdminLayoutProvider } from "@/components/admin/AdminLayoutContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function ClientAdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
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

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [authReady, user, router]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
