"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Button } from "@/components/ui/button";
import type { Product } from "@/actions/products.actions";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

type Props = {
  products: Product[];
};

export default function HomeProductsSwiper({ products }: Props) {
  const tHome = useTranslations("home");
  const locale = useLocale();

  if (products.length === 0) return null;

  const loop = products.length >= 2;

  return (
    <div className="home-products-swiper relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        autoplay={{
          delay: 4200,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        loop={loop}
        className="!pb-14"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {products.map((product) => {
          const name = locale === "ar" && product.nameAr ? product.nameAr : product.name;
          const desc =
            locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
          const cat =
            locale === "ar" && product.category.nameAr ? product.category.nameAr : product.category.name;

          return (
            <SwiperSlide key={product.id}>
              <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                <div className="relative aspect-[16/10] w-full md:aspect-[21/9]">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 80vw"
                      priority={product.id === products[0].id}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-primary/20 text-8xl dark:from-orange-950/50 dark:to-amber-950/20">
                      🍔
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 md:flex-row md:items-end md:justify-between md:p-10">
                    <div className="max-w-xl space-y-2 text-start">
                      <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                        {cat}
                      </span>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground drop-shadow-sm md:text-4xl md:leading-tight">
                        {name}
                      </h3>
                      {desc ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground md:text-base md:leading-relaxed">
                          {desc}
                        </p>
                      ) : null}
                      <p className="text-2xl font-bold tabular-nums text-primary md:text-3xl">
                        {formatCurrency(parseFloat(product.price), locale)}
                      </p>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className={cn(
                        "shrink-0 rounded-full px-8 shadow-lg shadow-primary/30",
                        "md:self-end"
                      )}
                    >
                      <Link href="/menu">{tHome("carousel_cta")}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
