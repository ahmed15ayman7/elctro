import type { Metadata } from "next";
import ClientAdminLayout from "@/components/admin/ClientAdminLayout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientAdminLayout>{children}</ClientAdminLayout>;
}
