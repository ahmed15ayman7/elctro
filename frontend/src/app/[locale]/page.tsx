import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { getProductsAction, getCategoriesAction } from "@/actions/products.actions";
import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/menu/ProductCard";
import { motion } from "framer-motion";
import HeroAnimations from "@/components/home/HeroAnimations";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const [productsResult, categoriesResult] = await Promise.all([
    getProductsAction(),
    getCategoriesAction(),
  ]);

  const products = productsResult.data?.slice(0, 4) ?? [];
  const categories = categoriesResult.data ?? [];

  const features = [
    { icon: Zap, key: "fast", label: locale === "ar" ? "توصيل سريع" : "Lightning Fast Delivery" },
    { icon: Shield, key: "safe", label: locale === "ar" ? "دفع آمن" : "Secure Payments" },
    { icon: Clock, key: "track", label: locale === "ar" ? "تتبع مباشر" : "Live Order Tracking" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <HeroScene />
        <HeroAnimations
          title={t("hero_title")}
          subtitle={t("hero_subtitle")}
          description={t("hero_description")}
          ctaOrder={t("cta_order")}
          ctaExplore={t("cta_explore")}
        />
      </section>

      {/* Feature highlights */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.key} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-2xl font-bold">{t("categories_title")}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/menu?category=${cat.id}`}
                  className="rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-white"
                >
                  {locale === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      {products.length > 0 && (
        <section className="bg-muted/20 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t("featured_title")}</h2>
              <Link href="/menu">
                <Button variant="ghost" className="gap-1.5">
                  {tNav("menu")}
                  <ArrowRight className="h-4 w-4 rtl-flip" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Elctro. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
      </footer>
    </div>
  );
}
