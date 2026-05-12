"use client";

import { useTransition } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { googleLoginAction } from "@/actions/auth.actions";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/hooks/use-toast";

export default function GoogleSignInButton() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isPending, startTransition] = useTransition();

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <GoogleLogin
        locale={locale}
        size="large"
        width="100%"
        text="continue_with"
        theme="outline"
        onSuccess={(res) => {
          const idToken = res.credential;
          if (!idToken) {
            toast({ title: t("google_error"), variant: "destructive" });
            return;
          }
          startTransition(async () => {
            const result = await googleLoginAction(idToken);
            if (result.success && result.data) {
              setAuth(result.data.user);
              toast({ title: t("google_welcome"), description: result.data.user.name });
              router.push(result.data.user.role === "ADMIN" ? "/admin" : "/");
            } else {
              toast({
                title: result.error ?? t("google_error"),
                variant: "destructive",
              });
            }
          });
        }}
        onError={() => {
          toast({ title: t("google_error"), variant: "destructive" });
        }}
      />
      {isPending ? (
        <p className="text-xs text-muted-foreground">{t("loading")}</p>
      ) : null}
    </div>
  );
}
