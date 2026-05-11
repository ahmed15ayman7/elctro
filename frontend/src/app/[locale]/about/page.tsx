import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import LegalArticle from "@/components/legal/LegalArticle";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("meta_title") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <header className="border-b bg-gradient-to-br from-primary/12 via-background to-background">
          <div className="container mx-auto px-4 py-14 md:py-20">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">{t("title")}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">{t("lead")}</p>
          </div>
        </header>
        <LegalArticle namespace="about" />
      </main>
      <SiteFooter />
    </div>
  );
}
