import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import OrdersClient from "@/components/orders/OrdersClient";
import { buildPageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    ...buildPageSeo({
      locale,
      pathname: "/orders",
      title: t("orders_title"),
      description: t("orders_description"),
      siteName: t("site_name"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function OrdersPage({ params }: Props) {
  await params;
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-muted/15 to-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-10 md:py-14">
        <OrdersClient />
      </main>
      <SiteFooter />
    </div>
  );
}
