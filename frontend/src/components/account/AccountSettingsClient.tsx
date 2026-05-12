"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Bell, BellOff, Loader2, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth.store";
import { updateProfileAction } from "@/actions/users.actions";
import {
  deletePushSubscriptionAction,
  getVapidPublicKeyAction,
  savePushSubscriptionAction,
} from "@/actions/notifications.actions";
import { toast } from "@/hooks/use-toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function AccountSettingsClient() {
  const t = useTranslations("account");
  const { user, patchUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [pendingProfile, startProfile] = useTransition();
  const [pendingPush, startPush] = useTransition();
  const [pushState, setPushState] = useState<"unknown" | "unsupported" | "denied" | "ready" | "subscribed">(
    "unknown"
  );
  const [subscriptionEndpoint, setSubscriptionEndpoint] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
      return;
    }
    setPushState(Notification.permission === "denied" ? "denied" : "ready");
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setSubscriptionEndpoint(sub?.endpoint ?? null);
  }, []);

  useEffect(() => {
    void refreshSubscription();
  }, [refreshSubscription]);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      toast({ title: t("name_invalid"), variant: "destructive" });
      return;
    }
    startProfile(async () => {
      const res = await updateProfileAction(trimmed);
      if (res.success && res.data) {
        patchUser({ name: res.data.name, imageUrl: res.data.imageUrl ?? null });
        toast({ title: t("profile_saved") });
      } else {
        toast({ title: res.error ?? t("profile_error"), variant: "destructive" });
      }
    });
  }

  async function handleEnablePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast({ title: t("push_unsupported"), variant: "destructive" });
      return;
    }
    startPush(async () => {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPushState("denied");
        toast({ title: t("push_denied"), variant: "destructive" });
        return;
      }
      const keyRes = await getVapidPublicKeyAction();
      if (!keyRes.success || !keyRes.data?.publicKey) {
        toast({ title: keyRes.error ?? t("push_unavailable"), variant: "destructive" });
        return;
      }
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe().catch(() => {});
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyRes.data.publicKey),
      });
      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        toast({ title: t("push_subscribe_failed"), variant: "destructive" });
        return;
      }
      const save = await savePushSubscriptionAction({
        subscription: {
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        },
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
      if (save.success) {
        setPushState("subscribed");
        setSubscriptionEndpoint(json.endpoint);
        toast({ title: t("push_enabled") });
      } else {
        toast({ title: save.error ?? t("push_subscribe_failed"), variant: "destructive" });
      }
    });
  }

  async function handleDisablePush() {
    if (!subscriptionEndpoint) {
      await refreshSubscription();
      return;
    }
    startPush(async () => {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        await sub?.unsubscribe().catch(() => {});
      }
      const res = await deletePushSubscriptionAction(subscriptionEndpoint);
      if (res.success) {
        setSubscriptionEndpoint(null);
        setPushState("ready");
        toast({ title: t("push_disabled") });
      } else {
        toast({ title: res.error ?? t("push_disable_failed"), variant: "destructive" });
      }
    });
  }

  if (!user) {
    return (
      <p className="text-center text-sm text-muted-foreground">{t("login_required")}</p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Settings className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile_section")}</CardTitle>
          <CardDescription>{t("profile_section_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="acc-email">{t("email")}</Label>
              <Input id="acc-email" value={user.email} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-name">{t("name")}</Label>
              <Input
                id="acc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                autoComplete="name"
              />
            </div>
            <Button type="submit" disabled={pendingProfile} className="gap-2">
              {pendingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("save_profile")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("push_section")}</CardTitle>
          <CardDescription>{t("push_section_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pushState === "unsupported" ? (
            <p className="text-sm text-muted-foreground">{t("push_unsupported")}</p>
          ) : pushState === "denied" ? (
            <p className="text-sm text-muted-foreground">{t("push_denied_hint")}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{t("push_hint")}</p>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void handleEnablePush()}
                  disabled={pendingPush || Boolean(subscriptionEndpoint)}
                  className="gap-2"
                >
                  {pendingPush && !subscriptionEndpoint ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  {t("push_enable")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleDisablePush()}
                  disabled={pendingPush || !subscriptionEndpoint}
                  className="gap-2"
                >
                  <BellOff className="h-4 w-4" />
                  {t("push_disable")}
                </Button>
              </div>
              {subscriptionEndpoint ? (
                <p className="text-xs text-muted-foreground">{t("push_active_hint")}</p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
