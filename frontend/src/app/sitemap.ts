import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/seo";

const PUBLIC_ROUTES = [
  "",
  "/menu",
  "/cart",
  "/checkout",
  "/orders",
  "/about",
  "/privacy",
  "/terms",
  "/auth/login",
  "/auth/register",
  "/account/settings",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of PUBLIC_ROUTES) {
      const url = `${base}/${locale}${path}`;
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: path === "" || path === "/menu" ? "daily" : "weekly",
        priority: path === "" ? 1 : path === "/menu" ? 0.9 : 0.65,
      });
    }
  }

  return entries;
}
