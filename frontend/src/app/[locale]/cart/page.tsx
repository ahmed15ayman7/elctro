import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import CartClient from "@/components/cart/CartClient";
import { buildPageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    ...buildPageSeo({
      locale,
      pathname: "/cart",
      title: t("cart_title"),
      description: t("cart_description"),
      siteName: t("site_name"),
    }),
  };
}

export default async function CartPage({ params }: Props) {
  await params;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-8">
        <CartClient />
      </main>
    </div>
  );
}
