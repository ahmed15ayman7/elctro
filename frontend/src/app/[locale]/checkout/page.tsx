import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getProductsAction } from "@/actions/products.actions";
import { buildPageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    ...buildPageSeo({
      locale,
      pathname: "/checkout",
      title: t("checkout_title"),
      description: t("checkout_description"),
      siteName: t("site_name"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: Props) {
  await params;
  const productsRes = await getProductsAction();
  const previewProducts = productsRes.data?.slice(0, 12) ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-muted/10 to-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-6 md:py-10">
        <CheckoutClient previewProducts={previewProducts} />
      </main>
    </div>
  );
}
