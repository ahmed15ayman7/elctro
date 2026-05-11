"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { createOrderAction } from "@/actions/orders.actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function CheckoutClient() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE_SIMULATED">("COD");
  const [orderId, setOrderId] = useState<string | null>(null);

  if (orderId) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 py-24 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        </motion.div>
        <h2 className="text-2xl font-bold">{t("success_title")}</h2>
        <p className="text-muted-foreground">{t("success_message", { id: orderId.slice(-8) })}</p>
        <div className="flex gap-4">
          <Link href="/orders">
            <Button>{t("track_order")}</Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline">Back to menu</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-muted-foreground">Please log in to checkout.</p>
        <Link href="/auth/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link href="/menu">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  function handleSubmit() {
    if (!address.trim()) {
      toast({ title: "Address required", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod,
        address,
        notes: notes || undefined,
      });

      if (result.success && result.data) {
        clearCart();
        setOrderId(result.data.id);
      } else {
        toast({ title: result.error ?? "Failed to place order", variant: "destructive" });
      }
    });
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-5">
      {/* Form */}
      <div className="flex flex-col gap-6 lg:col-span-3">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        <div className="flex flex-col gap-2">
          <Label htmlFor="address">{t("address")}</Label>
          <Input
            id="address"
            placeholder={t("address_placeholder")}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <textarea
            id="notes"
            placeholder={t("notes_placeholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-3">
          <Label>{t("payment_method")}</Label>
          <div className="flex flex-col gap-2">
            {(["COD", "ONLINE_SIMULATED"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  paymentMethod === method
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    paymentMethod === method ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}
                />
                <span className="text-sm font-medium">
                  {method === "COD" ? t("cod") : t("online")}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Button size="lg" onClick={handleSubmit} disabled={isPending} className="w-full">
          {isPending ? t("placing") : t("place_order")}
        </Button>
      </div>

      {/* Order summary */}
      <Card className="h-fit lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {items.map((item) => {
            const name = locale === "ar" && item.nameAr ? item.nameAr : item.name;
            return (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity, locale)}</span>
              </div>
            );
          })}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total(), locale)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
