"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { refreshAction } from "@/actions/auth.actions";
import { useAuthStore } from "@/store/auth.store";
import { Loader2 } from "lucide-react";

export default function OAuthDonePage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await refreshAction();
      if (cancelled) return;
      if (result.success && result.data) {
        setAuth(result.data.user);
        router.replace(result.data.user.role === "ADMIN" ? "/admin" : "/");
        return;
      }
      setError(result.error ?? t("oauth_sync_failed"));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [router, setAuth]);

  if (error) {
    return (
      <div className="container mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button asChild variant="outline">
          <Link href="/auth/login">{t("sign_in")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center gap-3 px-4 py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{t("oauth_finishing")}</p>
    </div>
  );
}
