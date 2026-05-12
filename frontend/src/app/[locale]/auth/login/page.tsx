import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import LoginForm from "@/components/auth/LoginForm";
import { buildPageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    ...buildPageSeo({
      locale,
      pathname: "/auth/login",
      title: t("login_title_meta"),
      description: t("login_description"),
      siteName: t("site_name"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({ params }: Props) {
  await params;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-8">
        <LoginForm />
      </main>
    </div>
  );
}
