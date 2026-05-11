"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, Package, Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Product, ProductUpdateInput } from "@/actions/products.actions";
import { deleteProductAction, updateProductAction } from "@/actions/products.actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Props = {
  product: Product;
  categories: Category[];
};

function categoryLabel(c: Category, locale: string) {
  return locale === "ar" && c.nameAr ? c.nameAr : c.name;
}

export default function AdminProductDetail({ product, categories }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [savePending, startSaveTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(product.name);
  const [nameAr, setNameAr] = useState(product.nameAr ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [descriptionAr, setDescriptionAr] = useState(product.descriptionAr ?? "");
  const [price, setPrice] = useState(product.price);
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [isActive, setIsActive] = useState(product.isActive);
  const [categoryId, setCategoryId] = useState(product.categoryId);

  useEffect(() => {
    if (editing) return;
    setName(product.name);
    setNameAr(product.nameAr ?? "");
    setDescription(product.description ?? "");
    setDescriptionAr(product.descriptionAr ?? "");
    setPrice(product.price);
    setImageUrl(product.imageUrl ?? "");
    setIsActive(product.isActive);
    setCategoryId(product.categoryId);
  }, [product, editing]);

  const displayName = locale === "ar" && product.nameAr ? product.nameAr : product.name;
  const displayNameEn = product.name;
  const displayDesc =
    locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
  const displayDescAlt =
    locale === "ar" ? product.description : product.descriptionAr;
  const catName =
    locale === "ar" && product.category.nameAr ? product.category.nameAr : product.category.name;

  function beginEdit() {
    setName(product.name);
    setNameAr(product.nameAr ?? "");
    setDescription(product.description ?? "");
    setDescriptionAr(product.descriptionAr ?? "");
    setPrice(product.price);
    setImageUrl(product.imageUrl ?? "");
    setIsActive(product.isActive);
    setCategoryId(product.categoryId);
    setEditing(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: t("product_dialog_validation_name"), variant: "destructive" });
      return;
    }
    if (!categoryId) {
      toast({ title: t("product_dialog_validation_name"), variant: "destructive" });
      return;
    }
    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast({ title: t("product_dialog_validation_price"), variant: "destructive" });
      return;
    }

    const body: ProductUpdateInput = {
      name: name.trim(),
      price: priceNum,
      categoryId,
      isActive,
      ...(nameAr.trim() ? { nameAr: nameAr.trim() } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(descriptionAr.trim() ? { descriptionAr: descriptionAr.trim() } : {}),
    };
    if (imageUrl.trim()) {
      try {
        new URL(imageUrl.trim());
        body.imageUrl = imageUrl.trim();
      } catch {
        toast({ title: t("product_dialog_validation_url"), variant: "destructive" });
        return;
      }
    }

    startSaveTransition(async () => {
      const res = await updateProductAction(product.id, body);
      if (res.success) {
        toast({ title: t("product_save_success") });
        setEditing(false);
        router.refresh();
      } else {
        toast({ title: res.error ?? t("product_save_error"), variant: "destructive" });
      }
    });
  }

  function handleDelete() {
    if (!confirm(t("delete_product_confirm"))) return;
    startDeleteTransition(async () => {
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

  const categoryOptions = categories.length > 0 ? categories : [product.category];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild className="gap-2">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("back_to_catalog")}
          </Link>
        </Button>
        {!editing ? (
          <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={beginEdit}>
            <Pencil className="h-4 w-4" aria-hidden />
            {t("edit_product")}
          </Button>
        ) : null}
      </div>

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
            {!editing ? (
              <>
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
              </>
            ) : (
              <form id="admin-product-edit-form" onSubmit={handleSave} className="flex flex-1 flex-col space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-p-cat">{t("select_category")}</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} disabled={savePending}>
                    <SelectTrigger id="edit-p-cat">
                      <SelectValue placeholder={t("select_category")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {categoryLabel(c, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-p-name">{t("product_name_en")}</Label>
                  <Input id="edit-p-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-p-name-ar">{t("product_name_ar")}</Label>
                  <Input id="edit-p-name-ar" value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-p-desc">{t("description_en")}</Label>
                  <Textarea id="edit-p-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-p-desc-ar">{t("description_ar")}</Label>
                  <Textarea
                    id="edit-p-desc-ar"
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    rows={3}
                    dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-p-price">{t("price")}</Label>
                    <Input
                      id="edit-p-price"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-p-img">{t("image_url")}</Label>
                    <Input
                      id="edit-p-img"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="edit-p-active" checked={isActive} onCheckedChange={(v) => setIsActive(v === true)} />
                  <Label htmlFor="edit-p-active" className="cursor-pointer font-normal">
                    {t("is_active")}
                  </Label>
                </div>
              </form>
            )}

            <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
              {editing ? (
                <>
                  <Button type="submit" form="admin-product-edit-form" disabled={savePending}>
                    {savePending ? t("saving") : t("save_changes")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={savePending}
                    onClick={() => setEditing(false)}
                  >
                    {t("cancel_edit")}
                  </Button>
                </>
              ) : null}
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                disabled={deletePending || savePending}
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {deletePending ? t("deleting") : t("delete_product")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
