"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Refetches server components when catalog changes over Socket.io. */
export default function CatalogRefreshListener() {
  const router = useRouter();

  useEffect(() => {
    const onCatalog = () => {
      router.refresh();
    };
    window.addEventListener("elctro:catalog-changed", onCatalog);
    return () => window.removeEventListener("elctro:catalog-changed", onCatalog);
  }, [router]);

  return null;
}
