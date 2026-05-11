"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Button } from "@/components/ui/button";
import type { Product } from "@/actions/products.actions";
import { formatCurrency, cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/pagination";

type Props = {
  products: Product[];
};

export default function HomeProductsSwiper({ products }: Props) {
  const tHome = useTranslations("home");
  const locale = useLocale();

  if (products.length === 0) return null;

  const loop = products.length >= 6;

  return (
    <div className="home-products-swiper relative">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={2}
        spaceBetween={14}
        breakpoints={{
          1024: {
            slidesPerView: 4,
            spaceBetween: 18,
          },
        }}
        watchOverflow
        speed={700}
        autoplay={{
          delay: 3800,
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
            <SwiperSlide key={product.id} className="!h-auto">
              <div className="flex h-full min-h-[280px] sm:min-h-[300px]">
                <div
                  className={cn(
                    "flex w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-md ring-1 ring-black/5 dark:ring-white/10",
                    "transition-shadow duration-200 hover:shadow-lg"
                  )}
                >
                  <Link href="/menu" className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-300 ease-out hover:scale-[1.04]"
                        sizes="(max-width: 1023px) 50vw, 25vw"
                        priority={product.id === products[0].id}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-primary/20 text-5xl dark:from-orange-950/50 dark:to-amber-950/20">
                        🍔
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <span className="absolute start-2 top-2 inline-block max-w-[85%] truncate rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm sm:text-xs">
                      {cat}
                    </span>
                  </Link>

                  <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
                    <div className="min-h-0 space-y-1">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug tracking-tight text-foreground sm:text-base">
                        <Link href="/menu" className="hover:text-primary hover:underline">
                          {name}
                        </Link>
                      </h3>
                      {desc ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">{desc}</p>
                      ) : null}
                    </div>
                    <div className="mt-auto flex flex-col gap-2 border-t border-border/50 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-base font-bold tabular-nums text-primary sm:text-lg">
                        {formatCurrency(parseFloat(product.price), locale)}
                      </p>
                      <Button asChild size="sm" className="w-full shrink-0 rounded-full px-4 sm:w-auto">
                        <Link href="/menu">{tHome("carousel_cta")}</Link>
                      </Button>
                    </div>
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
