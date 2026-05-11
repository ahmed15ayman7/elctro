"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import ProductCard from "./ProductCard";
import type { Product, Category } from "@/actions/products.actions";

interface Props {
  products: Product[];
  categories: Category[];
  locale: string;
  initialSearch: string;
  initialCategory: string;
}

export default function MenuClient({
  products,
  categories,
  locale,
  initialSearch,
  initialCategory,
}: Props) {
  const t = useTranslations("menu");
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const nameMatch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.nameAr ?? "").toLowerCase().includes(search.toLowerCase());
      const catMatch = !selectedCategory || p.categoryId === selectedCategory;
      return nameMatch && catMatch;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-primary text-white"
              : "border border-border bg-background hover:bg-muted"
          }`}
        >
          {t("all_categories")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-primary text-white"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            {locale === "ar" && cat.nameAr ? cat.nameAr : cat.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center text-muted-foreground"
        >
          {t("no_results")}
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence>
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
