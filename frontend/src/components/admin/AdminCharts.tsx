"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/actions/orders.actions";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#22c55e",
  PREPARING: "#3b82f6",
  OUT_FOR_DELIVERY: "#8b5cf6",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
};

const PAYMENT_COLORS = ["hsl(var(--primary))", "#94a3b8"];

type Props = {
  orders: Order[];
  locale: string;
};

/** Last 14 calendar days as ISO date strings (yyyy-mm-dd). */
function rolling14DayKeys(): string[] {
  const keys: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export default function AdminCharts({ orders, locale }: Props) {
  const t = useTranslations("admin");
  const tStatus = useTranslations("orders.statuses");

  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      map.set(o.status, (map.get(o.status) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({
      name,
      label: tStatus(name as "PENDING"),
      value,
    }));
  }, [orders, tStatus]);

  const paymentData = useMemo(() => {
    let cod = 0;
    let online = 0;
    for (const o of orders) {
      if (o.paymentMethod === "COD") cod += 1;
      else if (o.paymentMethod === "ONLINE_SIMULATED") online += 1;
      else cod += 1;
    }
    return [
      { name: t("chart_payment_cod"), value: cod, key: "cod" },
      { name: t("chart_payment_online"), value: online, key: "online" },
    ].filter((d) => d.value > 0);
  }, [orders, t]);

  const timeline = useMemo(() => {
    const revenueMap = new Map<string, number>();
    const countMap = new Map<string, number>();
    for (const o of orders) {
      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      revenueMap.set(d, (revenueMap.get(d) ?? 0) + parseFloat(o.total));
      countMap.set(d, (countMap.get(d) ?? 0) + 1);
    }
    const keys = rolling14DayKeys();
    let cum = 0;
    return keys.map((iso) => {
      const revenue = revenueMap.get(iso) ?? 0;
      const orderCount = countMap.get(iso) ?? 0;
      cum += revenue;
      return {
        date: iso.slice(5),
        revenue,
        orders: orderCount,
        cumulative: cum,
      };
    });
  }, [orders]);

  const hasOrders = orders.length > 0;

  if (!hasOrders) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t("chart_empty")}</p>
          <p className="max-w-sm text-xs text-muted-foreground">{t("chart_empty_hint")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{t("chart_section_analytics")}</h2>
            <p className="text-sm text-muted-foreground">{t("chart_section_analytics_desc")}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/80 shadow-sm lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t("chart_orders_by_status")}</CardTitle>
              <CardDescription className="text-xs">{t("chart_orders_by_status_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={82}
                    paddingAngle={2}
                    labelLine={false}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, t("chart_orders_label")]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t("chart_payment_mix")}</CardTitle>
              <CardDescription className="text-xs">{t("chart_payment_mix_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] pt-0">
              {paymentData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {t("chart_no_payment_data")}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={86}
                      paddingAngle={3}
                    >
                      {paymentData.map((entry, i) => (
                        <Cell key={entry.key} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v, t("chart_orders_label")]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t("chart_status_volume")}</CardTitle>
              <CardDescription className="text-xs">{t("chart_status_volume_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={100}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(v: number) => [v, t("chart_orders_label")]} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t("chart_revenue_by_day")}</CardTitle>
            <CardDescription className="text-xs">{t("chart_revenue_by_day_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => formatCurrency(typeof v === "number" ? v : Number(v), locale)}
                />
                <Tooltip
                  formatter={(value: number | string) =>
                    formatCurrency(typeof value === "number" ? value : Number(value), locale)
                  }
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t("chart_orders_per_day")}</CardTitle>
            <CardDescription className="text-xs">{t("chart_orders_per_day_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                <Tooltip formatter={(v: number | string) => [Number(v), t("chart_orders_label")]} />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#3b82f6" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{t("chart_cumulative_revenue")}</CardTitle>
          <CardDescription className="text-xs">{t("chart_cumulative_revenue_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="adminCumRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(v) => formatCurrency(typeof v === "number" ? v : Number(v), locale)}
              />
              <Tooltip
                formatter={(value: number | string) =>
                  formatCurrency(typeof value === "number" ? value : Number(value), locale)
                }
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#adminCumRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
