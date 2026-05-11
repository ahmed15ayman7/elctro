"use client";

import Image from "next/image";
import { useTransition } from "react";
import { ArrowLeft, Package, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Product } from "@/actions/products.actions";
import { deleteProductAction } from "@/actions/products.actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Props = {
  product: Product;
};

export default function AdminProductDetail({ product }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const displayName = locale === "ar" && product.nameAr ? product.nameAr : product.name;
  const displayNameEn = product.name;
  const displayDesc =
    locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
  const displayDescAlt =
    locale === "ar" ? product.description : product.descriptionAr;
  const catName =
    locale === "ar" && product.category.nameAr ? product.category.nameAr : product.category.name;

  function handleDelete() {
    if (!confirm(t("delete_product_confirm"))) return;
    startTransition(async () => {
      const res = await deleteProductAction(product.id);
      if (res.success) {
        toast({ title: t("delete_product") });
        router.push("/admin");
        router.refresh();
      } else {
        toast({ title: res.error ?? t("delete_failed"), variant: "destructive" });
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <Button variant="outline" size="sm" asChild className="gap-2">
        <Link href="/admin">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("back_to_catalog")}
        </Link>
      </Button>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative aspect-square w-full bg-muted md:aspect-auto md:min-h-[320px]">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={displayName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full min-h-[240px] items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                <Package className="h-20 w-20 text-muted-foreground/45" aria-hidden />
              </div>
            )}
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{catName}</Badge>
              <Badge variant={product.isActive ? "default" : "outline"}>
                {product.isActive ? t("status_active") : t("status_inactive")}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{displayName}</h1>
            {product.nameAr && locale === "ar" && (
              <p className="mt-1 text-sm text-muted-foreground">{displayNameEn}</p>
            )}
            {product.nameAr && locale !== "ar" && (
              <p className="mt-1 text-sm text-muted-foreground" dir="rtl">
                {product.nameAr}
              </p>
            )}
            <p className="mt-4 text-3xl font-bold tabular-nums text-primary">
              {formatCurrency(parseFloat(product.price), locale)}
            </p>

            <Separator className="my-6" />

            <h2 className="text-lg font-semibold">{t("product_description")}</h2>
            <div className="mt-3 flex-1 space-y-4">
              {displayDesc ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {displayDesc}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">{t("no_description")}</p>
              )}
              {displayDescAlt && displayDescAlt !== displayDesc && (
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {locale === "ar" ? t("description_en") : t("description_ar")}
                  </p>
                  <p
                    className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90"
                    dir={locale === "ar" ? "ltr" : "rtl"}
                  >
                    {displayDescAlt}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                disabled={pending}
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {pending ? t("deleting") : t("delete_product")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
