import Navbar from "@/components/layout/Navbar";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getProductsAction } from "@/actions/products.actions";

export default async function CheckoutPage() {
  const productsRes = await getProductsAction();
  const previewProducts = productsRes.data?.slice(0, 12) ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-muted/10 to-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-6 md:py-10">
        <CheckoutClient previewProducts={previewProducts} />
      </main>
    </div>
  );
}
