import type { Metadata } from "next";
import "./globals.css";

/** Root shell only; locale layout sets full metadata, `metadataBase`, and `lang`. */
export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
