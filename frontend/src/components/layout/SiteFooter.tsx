import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function SiteFooter() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-gradient-to-b from-muted/50 to-muted/80">
      <div className="container mx-auto px-4 py-12 md:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                E
              </div>
              <span className="text-lg font-bold tracking-tight">Elctro</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("tagline")}</p>
          </div>
          <div className="flex flex-wrap gap-10 text-sm md:gap-16">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("company_heading")}
              </p>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/about"
                  className="text-foreground/90 transition-colors hover:text-primary"
                >
                  {t("about")}
                </Link>
                <Link href="/menu" className="text-muted-foreground transition-colors hover:text-primary">
                  {tNav("menu")}
                </Link>
              </nav>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("legal_heading")}
              </p>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("privacy")}
                </Link>
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("terms")}
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-border/50 pt-8 text-center text-xs text-muted-foreground">
          © {year} Elctro. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
