import Navbar from "@/components/layout/Navbar";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-8">
        <CheckoutClient />
      </main>
    </div>
  );
}
