import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import OrdersClient from "@/components/orders/OrdersClient";

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-muted/15 to-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-10 md:py-14">
        <OrdersClient />
      </main>
      <SiteFooter />
    </div>
  );
}
