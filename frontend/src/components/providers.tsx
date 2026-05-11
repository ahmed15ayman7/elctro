"use client";

import { type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { SocketProvider } from "@/components/providers/SocketProvider";
import CatalogRefreshListener from "@/components/providers/CatalogRefreshListener";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      {children}
      <CatalogRefreshListener />
      <Toaster />
    </SocketProvider>
  );
}
