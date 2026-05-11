import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elctro — Online Food Ordering",
  description: "Order delicious food delivered fast to your door.",
};

// This root layout is intentionally minimal; the locale layout handles
// locale-specific attributes (lang, dir, fonts).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
