import Navbar from "@/components/layout/Navbar";
import OrdersClient from "@/components/orders/OrdersClient";

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-8">
        <OrdersClient />
      </main>
    </div>
  );
}
