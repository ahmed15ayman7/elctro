"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AdminTab = "overview" | "categories" | "products" | "orders" | "users";

type AdminLayoutContextValue = {
  tab: AdminTab;
  setTab: (tab: AdminTab) => void;
};

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const value = useMemo(() => ({ tab, setTab }), [tab]);
  return (
    <AdminLayoutContext.Provider value={value}>
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const ctx = useContext(AdminLayoutContext);
  if (!ctx) {
    throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  }
  return ctx;
}
