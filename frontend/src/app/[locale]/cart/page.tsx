import { getTranslations } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import CartClient from "@/components/cart/CartClient";

export default async function CartPage() {
  const t = await getTranslations("cart");
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-8">
        <CartClient />
      </main>
    </div>
  );
}
