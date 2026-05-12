"use client";

import { useMemo, useState } from "react";
import { Search, Shield } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { AdminUser } from "@/actions/users.actions";
import { updateUserRoleAction } from "@/actions/users.actions";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/hooks/use-toast";
import UserAvatar from "@/components/common/UserAvatar";

type Props = {
  users: AdminUser[];
  onUserUpdated: (user: AdminUser) => void;
};

export default function AdminUsersPanel({ users, onUserUpdated }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { user: currentUser } = useAuthStore();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [users, query]);

  async function handleRoleChange(userId: string, role: "CUSTOMER" | "ADMIN") {
    if (currentUser?.id === userId && role === "CUSTOMER") {
      toast({ title: t("users_cannot_demote_self"), variant: "destructive" });
      return;
    }
    setBusyId(userId);
    const res = await updateUserRoleAction(userId, role);
    setBusyId(null);
    if (res.success && res.data) {
      onUserUpdated(res.data);
      toast({ title: t("users_role_updated") });
    } else {
      toast({ title: res.error ?? t("users_role_failed"), variant: "destructive" });
    }
  }

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <Card className="border-border/80">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-lg">{t("users_list_title")}</CardTitle>
              <CardDescription>
                {t("users_list_desc", { count: users.length })}
              </CardDescription>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("users_search_placeholder")}
                className="ps-9"
                aria-label={t("users_search_placeholder")}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">{t("users_no_results")}</p>
          ) : (
            filtered.map((u) => {
              const isAdmin = u.role === "ADMIN";
              const orderCount = u._count?.orders ?? 0;
              const self = currentUser?.id === u.id;
              return (
                <div
                  key={u.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="flex min-w-0 gap-3">
                    <div className="relative shrink-0">
                      <UserAvatar name={u.name} imageUrl={u.imageUrl} size="sm" />
                      {isAdmin ? (
                        <span
                          className="absolute -bottom-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground shadow-sm"
                          title={t("users_role_admin")}
                          aria-hidden
                        >
                          <Shield className="h-2.5 w-2.5" />
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{u.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(u.createdAt, locale)} · {t("users_orders_count", { count: orderCount })}
                        {self ? ` · ${t("users_you")}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-nowrap items-center gap-2 sm:shrink-0">
                    <Badge variant={isAdmin ? "default" : "secondary"}>{isAdmin ? t("users_role_admin") : t("users_role_customer")}</Badge>
                    <Select
                      value={u.role}
                      disabled={busyId === u.id}
                      onValueChange={(v) => handleRoleChange(u.id, v as "CUSTOMER" | "ADMIN")}
                    >
                      <SelectTrigger
                        className="h-9 w-[min(100%,11rem)] min-w-[9.5rem]"
                        aria-label={t("users_change_role")}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOMER">{t("users_role_customer")}</SelectItem>
                        <SelectItem value="ADMIN">{t("users_role_admin")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
