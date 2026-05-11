import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCategoriesAction, getProductAction } from "@/actions/products.actions";
import AdminProductDetail from "@/components/admin/AdminProductDetail";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const res = await getProductAction(id);
  const t = await getTranslations("admin");
  const title = res.data?.name
    ? `${res.data.name} — ${t("product_detail_meta")}`
    : t("product_detail_meta");
  return { title };
}

export default async function AdminProductPage({ params }: Props) {
  const { id } = await params;
  const [res, categoriesRes] = await Promise.all([getProductAction(id), getCategoriesAction()]);
  if (!res.success || !res.data) {
    notFound();
  }
  return <AdminProductDetail product={res.data} categories={categoriesRes.data ?? []} />;
}
