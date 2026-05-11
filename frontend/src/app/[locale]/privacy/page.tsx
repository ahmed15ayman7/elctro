import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import LegalArticle from "@/components/legal/LegalArticle";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return { title: t("meta_title") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <header className="border-b bg-muted/40">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t("updated")}</p>
          </div>
        </header>
        <LegalArticle namespace="privacy" />
      </main>
      <SiteFooter />
    </div>
  );
}
