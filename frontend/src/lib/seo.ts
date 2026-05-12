/**
 * Canonical site origin for metadata, OG URLs, sitemap, and JSON-LD.
 * Set `NEXT_PUBLIC_SITE_URL` in production (e.g. https://elctro.com).
 */
import type { Metadata } from "next";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

/** Path with locale prefix, e.g. localePath("en", "/menu") -> "/en/menu" */
export function localePath(locale: string, pathname: string): string {
  const p = pathname === "" || pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${locale}${p}`;
}

export function absoluteUrl(locale: string, pathname: string): string {
  return `${getSiteUrl()}${localePath(locale, pathname)}`;
}

export function alternatesForRoute(locale: string, pathname: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const base = getSiteUrl();
  const path = pathname === "" || pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  return {
    canonical: `${base}/${locale}${path}`,
    languages: {
      en: `${base}/en${path}`,
      ar: `${base}/ar${path}`,
      "x-default": `${base}/en${path}`,
    },
  };
}

export function buildPageSeo(options: {
  locale: string;
  pathname: string;
  title: string;
  description: string;
  siteName: string;
}): Pick<Metadata, "title" | "description" | "alternates" | "openGraph" | "twitter"> {
  const { locale, pathname, title, description, siteName } = options;
  const ogLocale = locale === "ar" ? "ar_SA" : "en_US";
  return {
    title,
    description,
    alternates: alternatesForRoute(locale, pathname),
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(locale, pathname),
      siteName,
      locale: ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
