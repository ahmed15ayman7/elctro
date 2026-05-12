import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCategoriesAction, getProductAction } from "@/actions/products.actions";
import AdminProductDetail from "@/components/admin/AdminProductDetail";
import { buildPageSeo } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const res = await getProductAction(id);
  const t = await getTranslations({ locale, namespace: "admin" });
  const tSeo = await getTranslations({ locale, namespace: "seo" });
  const baseTitle = res.data?.name
    ? `${res.data.name} — ${t("product_detail_meta")}`
    : t("product_detail_meta");
  const rawDesc = res.data?.description ?? res.data?.descriptionAr ?? "";
  const description =
    typeof rawDesc === "string" && rawDesc.trim().length > 0
      ? rawDesc.trim().slice(0, 158)
      : t("product_detail_meta");
  return {
    ...buildPageSeo({
      locale,
      pathname: `/admin/products/${id}`,
      title: baseTitle,
      description,
      siteName: tSeo("site_name"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function AdminProductPage({ params }: Props) {
  const { id } = await params;
  const [res, categoriesRes] = await Promise.all([getProductAction(id), getCategoriesAction()]);
  if (!res.success || !res.data) {
    notFound();
  }
  return <AdminProductDetail product={res.data} categories={categoriesRes.data ?? []} />;
}
