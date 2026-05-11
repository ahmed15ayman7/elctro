"use client";

import { useCallback, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { createOrderAction } from "@/actions/orders.actions";
import type { Product } from "@/actions/products.actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import CheckoutGuestGate from "@/components/checkout/CheckoutGuestGate";

const CheckoutMapPickerDynamic = dynamic(() => import("@/components/checkout/CheckoutMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export default function CheckoutClient({ previewProducts = [] }: { previewProducts?: Product[] }) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const locale = useLocale();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [locationLink, setLocationLink] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE_SIMULATED">("COD");
  const [orderId, setOrderId] = useState<string | null>(null);

  const clearMapCoords = useCallback(() => {
    setLatitude(null);
    setLongitude(null);
  }, []);

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
            <Button variant="outline">{t("back_menu")}</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl py-6 md:py-10">
        <CheckoutGuestGate products={previewProducts} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-3xl border border-dashed bg-muted/30 px-8 py-16 text-center">
        <p className="text-lg font-medium">{t("empty_cart_title")}</p>
        <p className="text-sm text-muted-foreground">{tCart("empty")}</p>
        <Link href="/menu">
          <Button size="lg" className="rounded-full px-8">
            {t("empty_cart_cta")}
          </Button>
        </Link>
      </div>
    );
  }

  function handleSubmit() {
    if (!address.trim()) {
      toast({ title: t("address_required"), variant: "destructive" });
      return;
    }
    if (!phone.trim() || phone.trim().length < 5) {
      toast({ title: t("phone_invalid"), variant: "destructive" });
      return;
    }

    const trimmedLink = locationLink.trim();
    let latOut: number | undefined;
    let lngOut: number | undefined;
    let linkOut: string | undefined;

    if (trimmedLink) {
      try {
        new URL(trimmedLink);
      } catch {
        toast({ title: t("invalid_location_url"), variant: "destructive" });
        return;
      }
      linkOut = trimmedLink;
    } else if (latitude != null && longitude != null) {
      latOut = latitude;
      lngOut = longitude;
    } else {
      toast({ title: t("location_required"), variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod,
        address,
        notes: notes || undefined,
        phone: phone.trim(),
        contactInfo: contactInfo.trim() || undefined,
        latitude: latOut,
        longitude: lngOut,
        locationLink: linkOut,
      });

      if (result.success && result.data) {
        clearCart();
        setOrderId(result.data.id);
      } else {
        toast({ title: result.error ?? t("order_failed"), variant: "destructive" });
      }
    });
  }

  const hasLink = Boolean(locationLink.trim());

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-5">
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
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t("phone_placeholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact">{t("contact_info")}</Label>
          <Textarea
            id="contact"
            placeholder={t("contact_placeholder")}
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="loc-link">{t("location_link")}</Label>
          <Input
            id="loc-link"
            type="url"
            placeholder={t("location_link_placeholder")}
            value={locationLink}
            onChange={(e) => {
              setLocationLink(e.target.value);
              if (e.target.value.trim()) clearMapCoords();
            }}
          />
          <p className="text-xs text-muted-foreground">{t("location_link_hint")}</p>
        </div>

        {!hasLink ? (
          <CheckoutMapPickerDynamic
            onPositionChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
              setLocationLink("");
            }}
            onClear={clearMapCoords}
            hasLink={hasLink}
            labelHint={t("map_hint")}
          />
        ) : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Textarea
            id="notes"
            placeholder={t("notes_placeholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
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

      <Card className="h-fit lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">{t("summary_title")}</CardTitle>
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
            <span>{t("summary_total")}</span>
            <span>{formatCurrency(total(), locale)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
