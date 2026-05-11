"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  createProductAction,
  type Category,
  type Product,
  type ProductCreateInput,
} from "@/actions/products.actions";
import { toast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onCreated: (product: Product) => void;
};

export default function AdminCreateProductDialog({
  open,
  onOpenChange,
  categories,
  onCreated,
}: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const [pCategoryId, setPCategoryId] = useState("");
  const [pName, setPName] = useState("");
  const [pNameAr, setPNameAr] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pDescAr, setPDescAr] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pImage, setPImage] = useState("");
  const [pActive, setPActive] = useState(true);

  useEffect(() => {
    if (open && categories.length && !pCategoryId) {
      setPCategoryId(categories[0].id);
    }
  }, [open, categories, pCategoryId]);

  function reset() {
    setPName("");
    setPNameAr("");
    setPDesc("");
    setPDescAr("");
    setPPrice("");
    setPImage("");
    setPActive(true);
    if (categories[0]) setPCategoryId(categories[0].id);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pName.trim() || !pCategoryId) {
      toast({ title: t("product_dialog_validation_name"), variant: "destructive" });
      return;
    }
    const price = parseFloat(pPrice);
    if (Number.isNaN(price) || price <= 0) {
      toast({ title: t("product_dialog_validation_price"), variant: "destructive" });
      return;
    }
    const body: ProductCreateInput = {
      name: pName.trim(),
      price,
      categoryId: pCategoryId,
      isActive: pActive,
      ...(pNameAr.trim() ? { nameAr: pNameAr.trim() } : {}),
      ...(pDesc.trim() ? { description: pDesc.trim() } : {}),
      ...(pDescAr.trim() ? { descriptionAr: pDescAr.trim() } : {}),
    };
    if (pImage.trim()) {
      try {
        new URL(pImage.trim());
        body.imageUrl = pImage.trim();
      } catch {
        toast({ title: t("product_dialog_validation_url"), variant: "destructive" });
        return;
      }
    }

    startTransition(async () => {
      const res = await createProductAction(body);
      if (res.success && res.data) {
        onCreated(res.data);
        reset();
        onOpenChange(false);
        toast({ title: t("product_dialog_success") });
      } else {
        toast({ title: res.error ?? t("product_dialog_error"), variant: "destructive" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create_product")}</DialogTitle>
          <DialogDescription>{t("image_optional")}</DialogDescription>
        </DialogHeader>
        {categories.length === 0 ? (
          <p className="px-6 pb-4 text-sm text-muted-foreground">{t("no_categories")}</p>
        ) : (
          <form id="admin-create-product-form" onSubmit={submit} className="space-y-4 px-6 py-2">
            <div className="space-y-2">
              <Label htmlFor="dlg-p-cat">{t("select_category")}</Label>
              <Select value={pCategoryId} onValueChange={setPCategoryId} disabled={pending}>
                <SelectTrigger id="dlg-p-cat">
                  <SelectValue placeholder={t("select_category")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {locale === "ar" && c.nameAr ? c.nameAr : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-p-name">{t("product_name_en")}</Label>
              <Input id="dlg-p-name" value={pName} onChange={(e) => setPName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-p-name-ar">{t("product_name_ar")}</Label>
              <Input id="dlg-p-name-ar" value={pNameAr} onChange={(e) => setPNameAr(e.target.value)} dir="rtl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-p-desc">{t("description_en")}</Label>
              <Textarea id="dlg-p-desc" value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-p-desc-ar">{t("description_ar")}</Label>
              <Textarea id="dlg-p-desc-ar" value={pDescAr} onChange={(e) => setPDescAr(e.target.value)} rows={2} dir="rtl" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dlg-p-price">{t("price")}</Label>
                <Input
                  id="dlg-p-price"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dlg-p-img">{t("image_url")}</Label>
                <Input
                  id="dlg-p-img"
                  type="url"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  placeholder="https://…"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="dlg-p-active" checked={pActive} onCheckedChange={(v) => setPActive(v === true)} />
              <Label htmlFor="dlg-p-active" className="cursor-pointer font-normal">
                {t("is_active")}
              </Label>
            </div>
          </form>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("product_dialog_cancel")}
          </Button>
          {categories.length > 0 ? (
            <Button type="submit" form="admin-create-product-form" disabled={pending}>
              {pending ? t("creating") : t("save_product")}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
