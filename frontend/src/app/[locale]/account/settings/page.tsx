import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import AccountSettingsClient from "@/components/account/AccountSettingsClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("meta_title") };
}

export default function AccountSettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-muted/10 to-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-6 md:py-10">
        <AccountSettingsClient />
      </main>
    </div>
  );
}
