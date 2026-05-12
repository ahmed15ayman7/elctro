"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction } from "@/actions/auth.actions";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/hooks/use-toast";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success && result.data) {
        setAuth(result.data.user);
        toast({ title: "Welcome back!", description: result.data.user.name });
        router.push(result.data.user.role === "ADMIN" ? "/admin" : "/");
      } else {
        toast({ title: result.error ?? "Login failed", variant: "destructive" });
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{t("login_title")}</CardTitle>
          <CardDescription>{t("login_subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleSignInButton />
          <p className="text-center text-xs text-muted-foreground">
            <Link href="/auth/google/start" className="text-primary underline-offset-4 hover:underline">
              {t("google_redirect")}
            </Link>
          </p>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t("google_or")}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? t("loading") : t("submit_login")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          {t("no_account")}&nbsp;
          <Link href="/auth/register" className="text-primary hover:underline">
            {t("sign_up")}
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
