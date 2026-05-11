"use client";

import Image from "next/image";
import { Fragment, useState } from "react";
import { Check, ChevronDown, MapPin, StickyNote, User } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/actions/orders.actions";

const FULFILLMENT = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

type FulfillmentStatus = (typeof FULFILLMENT)[number];

const ALL_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

type Props = {
  order: Order;
  onStatusChange: (orderId: string, status: string) => void;
};

export default function AdminOrderCard({ order, onStatusChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const tAdmin = useTranslations("admin");
  const tStatus = useTranslations("orders.statuses");
  const locale = useLocale();

  const shortId = order.id.slice(-8).toUpperCase();
  const isCancelled = order.status === "CANCELLED";
  const rawIdx = FULFILLMENT.indexOf(order.status as FulfillmentStatus);
  const currentIdx = isCancelled ? -1 : Math.max(0, rawIdx);

  const customerName = order.user?.name?.trim() || tAdmin("order_guest");
  const email = order.user?.email;
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  const paymentLabel =
    order.paymentMethod === "COD"
      ? tAdmin("payment_cod")
      : order.paymentMethod === "ONLINE_SIMULATED"
        ? tAdmin("payment_online")
        : order.paymentMethod;

  const statusBadgeKey = (ALL_STATUSES.includes(order.status as (typeof ALL_STATUSES)[number])
    ? order.status
    : "PENDING") as (typeof ALL_STATUSES)[number];

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.04] transition-shadow dark:ring-white/[0.06]",
        "hover:shadow-md"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-3 border-b border-border/60 bg-gradient-to-br from-muted/50 via-card to-card p-4 text-start transition-colors hover:bg-muted/30 sm:gap-4 sm:p-5"
        aria-expanded={expanded}
      >
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
          aria-hidden
        />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary" aria-hidden>
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-medium uppercase tracking-wide text-muted-foreground">#{shortId}</span>
            <Badge variant="outline" className="hidden font-normal sm:inline-flex">
              {paymentLabel}
            </Badge>
          </div>
          <p className="truncate font-semibold text-foreground">{customerName}</p>
          <p className="text-xs text-muted-foreground">
            {itemCount} {tAdmin("order_items_short")}
            {email ? ` · ${email.split("@")[0]}…` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-lg font-bold tabular-nums text-primary sm:text-xl">
            {formatCurrency(parseFloat(order.total), locale)}
          </span>
          <Badge
            variant={isCancelled ? "destructive" : currentIdx >= FULFILLMENT.length - 1 ? "default" : "secondary"}
            className="text-[10px] font-medium sm:text-xs"
          >
            {tStatus(statusBadgeKey)}
          </Badge>
        </div>
      </button>

      {expanded ? (
        <>
          <div className="hidden border-b border-border/60 bg-gradient-to-br from-muted/40 via-card to-card px-5 pb-4 pt-0 sm:block">
            <p className="text-xs text-muted-foreground">
              {tAdmin("order_placed")} · {formatDate(order.createdAt, locale)}
            </p>
            {email ? <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p> : null}
          </div>

          {isCancelled ? (
            <div className="border-b border-destructive/20 bg-destructive/10 px-5 py-3 text-sm text-destructive">
              {tAdmin("order_cancelled_notice")}
            </div>
          ) : null}

          <div className="px-5 py-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tAdmin("order_tracking")}
            </p>
            <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-[min(100%,680px)] items-center">
                {FULFILLMENT.map((step, i) => {
                  const done = !isCancelled && currentIdx > i;
                  const active = !isCancelled && currentIdx === i;
                  const pending = isCancelled || currentIdx < i;

                  return (
                    <Fragment key={step}>
                      {i > 0 ? (
                        <div
                          className={cn(
                            "mx-0.5 h-1 min-w-[16px] flex-1 rounded-full transition-colors",
                            !isCancelled && currentIdx >= i ? "bg-primary" : "bg-muted-foreground/20"
                          )}
                          aria-hidden
                        />
                      ) : null}
                      <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-2 sm:w-[5.5rem]">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors",
                            done && "border-primary bg-primary text-primary-foreground",
                            active && "border-primary bg-primary/15 text-primary ring-4 ring-primary/25",
                            pending && "border-muted-foreground/25 bg-muted/50 text-muted-foreground"
                          )}
                        >
                          {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                        </div>
                        <p
                          className={cn(
                            "text-center text-[10px] font-semibold leading-tight sm:text-xs",
                            active && "text-primary",
                            done && "text-foreground",
                            pending && "text-muted-foreground"
                          )}
                        >
                          {tStatus(step)}
                        </p>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <Separator />

          <div className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tAdmin("order_line_items")}
            </p>
            {order.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{tAdmin("order_no_items")}</p>
            ) : (
              <ul className="space-y-3">
                {order.items.map((line) => {
                  const unit = parseFloat(line.unitPrice);
                  const lineTotal = unit * line.quantity;
                  return (
                    <li
                      key={line.id}
                      className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 sm:items-center"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {line.product.imageUrl ? (
                          <Image
                            src={line.product.imageUrl}
                            alt={line.product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl">🍔</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug text-foreground">{line.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(unit, locale)} × {line.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold tabular-nums text-foreground sm:text-base">
                        {formatCurrency(lineTotal, locale)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {(order.address || order.notes) && (
            <>
              <Separator />
              <div className="space-y-4 p-5">
                {order.address ? (
                  <div className="flex gap-3 rounded-xl border border-border/50 bg-background/80 p-4">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {tAdmin("order_address")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground">{order.address}</p>
                    </div>
                  </div>
                ) : null}
                {order.notes ? (
                  <div className="flex gap-3 rounded-xl border border-dashed border-border/80 bg-muted/15 p-4">
                    <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {tAdmin("order_notes")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground">{order.notes}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor={`order-status-${order.id}`} className="text-sm font-medium text-foreground">
              {tAdmin("order_update_status")}
            </label>
            <select
              id={`order-status-${order.id}`}
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="h-10 w-full max-w-xs rounded-lg border border-input bg-background px-3 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {tStatus(s)}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}
    </article>
  );
}
