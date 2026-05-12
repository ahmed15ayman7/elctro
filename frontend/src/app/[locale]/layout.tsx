import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Providers from "@/components/providers";
import { absoluteUrl, alternatesForRoute, getSiteUrl } from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "seo" });
  const siteUrl = getSiteUrl();
  const title = t("default_title");
  const description = t("default_description");
  const siteName = t("site_name");
  const ogLocale = locale === "ar" ? "ar_SA" : "en_US";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: t("title_template"),
    },
    description,
    applicationName: siteName,
    alternates: alternatesForRoute(locale, ""),
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: absoluteUrl(locale, ""),
      siteName,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();
  const isRtl = locale === "ar";

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`min-h-screen antialiased ${
          isRtl ? "font-arabic" : "font-sans"
        }`}
        style={
          {
            "--font-sans": "'Inter', system-ui, sans-serif",
            "--font-arabic": "'Noto Sans Arabic', sans-serif",
          } as React.CSSProperties
        }
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
