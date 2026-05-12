import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import AccountSettingsClient from "@/components/account/AccountSettingsClient";
import { buildPageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  const tSeo = await getTranslations({ locale, namespace: "seo" });
  return {
    ...buildPageSeo({
      locale,
      pathname: "/account/settings",
      title: t("meta_title"),
      description: t("meta_description"),
      siteName: tSeo("site_name"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function AccountSettingsPage({ params }: Props) {
  await params;
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-muted/10 to-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-6 md:py-10">
        <AccountSettingsClient />
      </main>
    </div>
  );
}
