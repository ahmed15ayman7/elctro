import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import LegalArticle from "@/components/legal/LegalArticle";
import { buildPageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const tSeo = await getTranslations({ locale, namespace: "seo" });
  const title = t("meta_title");
  const description = t("meta_description");
  return {
    ...buildPageSeo({
      locale,
      pathname: "/privacy",
      title,
      description,
      siteName: tSeo("site_name"),
    }),
  };
}

export default async function PrivacyPage({ params }: Props) {
  await params;
  const t = await getTranslations("privacy");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <header className="border-b bg-muted/40">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("updated")}</p>
          </div>
        </header>
        <LegalArticle namespace="privacy" />
      </main>
      <SiteFooter />
    </div>
  );
}
