import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProductsAction, getCategoriesAction } from "@/actions/products.actions";
import { buildPageSeo } from "@/lib/seo";
import Navbar from "@/components/layout/Navbar";
import MenuClient from "@/components/menu/MenuClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; search?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    ...buildPageSeo({
      locale,
      pathname: "/menu",
      title: t("menu_title"),
      description: t("menu_description"),
      siteName: t("site_name"),
    }),
  };
}

export default async function MenuPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category, search } = await searchParams;
  const t = await getTranslations("menu");

  const [productsResult, categoriesResult] = await Promise.all([
    getProductsAction({ categoryId: category, search }),
    getCategoriesAction(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-8">
        <MenuClient
          products={productsResult.data ?? []}
          categories={categoriesResult.data ?? []}
          locale={locale}
          initialSearch={search ?? ""}
          initialCategory={category ?? ""}
        />
      </main>
    </div>
  );
}
