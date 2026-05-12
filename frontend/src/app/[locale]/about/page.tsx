import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import LegalArticle from "@/components/legal/LegalArticle";
import { buildPageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const tSeo = await getTranslations({ locale, namespace: "seo" });
  const title = t("meta_title");
  const description = t("lead").slice(0, 158);
  return {
    ...buildPageSeo({
      locale,
      pathname: "/about",
      title,
      description,
      siteName: tSeo("site_name"),
    }),
  };
}

export default async function AboutPage({ params }: Props) {
  await params;
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
