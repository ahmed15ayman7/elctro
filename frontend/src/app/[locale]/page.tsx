import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import { buildPageSeo, getSiteUrl } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Truck, UtensilsCrossed, Zap, Shield, Clock } from "lucide-react";
import { getProductsAction, getCategoriesAction } from "@/actions/products.actions";
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import HeroAnimations from "@/components/home/HeroAnimations";
import HomeProductsSwiper from "@/components/home/HomeProductsSwiper";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"));

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    ...buildPageSeo({
      locale,
      pathname: "",
      title: t("home_title"),
      description: t("home_description"),
      siteName: t("site_name"),
    }),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const tSeo = await getTranslations({ locale, namespace: "seo" });
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: tSeo("site_name"),
        url: siteUrl,
        description: tSeo("jsonld_description"),
      },
      {
        "@type": "WebSite",
        name: tSeo("site_name"),
        url: `${siteUrl}/${locale}`,
        inLanguage: locale,
      },
    ],
  };

  const [productsResult, categoriesResult] = await Promise.all([
    getProductsAction(),
    getCategoriesAction(),
  ]);

  const carouselProducts = productsResult.data?.slice(0, 12) ?? [];
  const categories = categoriesResult.data ?? [];

  const featureIcons = [Zap, Shield, Clock] as const;
  const featureKeys = ["fast", "safe", "track"] as const;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          <HeroScene />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background/90 via-background/45 to-background"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.18),transparent)]" />

        <HeroAnimations
          heroBadge={t("hero_badge")}
          title={t("hero_title")}
          subtitle={t("hero_subtitle")}
          description={t("hero_description")}
          ctaOrder={t("cta_order")}
          ctaExplore={t("cta_explore")}
        />
      </section>

      {/* Product showcase — Swiper autoplay (large food imagery) */}
      {carouselProducts.length > 0 && (
        <section className="relative z-10 border-b bg-gradient-to-b from-background via-muted/20 to-muted/40 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("carousel_title")}</h2>
                <p className="mt-2 max-w-xl text-muted-foreground">{t("carousel_subtitle")}</p>
              </div>
              <Link href="/menu">
                <Button variant="outline" className="gap-2 self-start rounded-full border-primary/30">
                  {tNav("menu")}
                  <ArrowRight className="h-4 w-4 rtl-flip" />
                </Button>
              </Link>
            </div>
            <HomeProductsSwiper products={carouselProducts} />
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="relative z-10 border-y bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("value_title")}</h2>
            <p className="mt-3 text-muted-foreground md:text-lg">{t("value_subtitle")}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {featureKeys.map((key, i) => {
              const Icon = featureIcons[i];
              return (
                <div
                  key={key}
                  className="group flex flex-col rounded-2xl border border-border/80 bg-background/80 p-6 text-center shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{t(`features.${key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`features.${key}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">{t("how_title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{t("how_subtitle")}</p>
          <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-3">
            {(["1", "2", "3"] as const).map((num, index) => {
              const icons = [UtensilsCrossed, Truck, Sparkles];
              const Icon = icons[index];
              return (
                <div key={num} className="relative text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary ring-2 ring-primary/20">
                    {num}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Icon className="h-8 w-8 text-muted-foreground" aria-hidden />
                  </div>
                  <h3 className="mt-3 font-semibold">{t(`step${num}_title`)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t(`step${num}_desc`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-y bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-2xl font-bold md:text-3xl">{t("categories_title")}</h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
              {t("categories_subtitle")}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3 md:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/menu?category=${cat.id}`}
                  className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {locale === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="border-t bg-gradient-to-r from-primary/15 via-background to-primary/10 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t("cta_band_title")}</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{t("cta_band_desc")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/menu">
              <Button size="lg" className="gap-2 rounded-full px-8 shadow-lg shadow-primary/25">
                {t("cta_order")}
                <ArrowRight className="h-5 w-5 rtl-flip" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                {tNav("about_us")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
