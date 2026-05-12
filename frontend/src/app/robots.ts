import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const adminDisallow = routing.locales.map((locale) => `/${locale}/admin`);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: adminDisallow,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
