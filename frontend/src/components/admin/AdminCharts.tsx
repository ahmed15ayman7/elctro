"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/actions/orders.actions";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#a855f7", "#ef4444", "#94a3b8"];

type Props = {
  orders: Order[];
  locale: string;
};

export default function AdminCharts({ orders, locale }: Props) {
  const t = useTranslations("admin");

  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      map.set(o.status, (map.get(o.status) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [orders]);

  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      map.set(d, (map.get(d) ?? 0) + parseFloat(o.total));
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, total]) => ({ date: date.slice(5), total }));
  }, [orders]);

  if (orders.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-6">{t("chart_empty")}</p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{t("chart_orders_by_status")}</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={88}
                paddingAngle={2}
                labelLine={false}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{t("chart_revenue_by_day")}</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) =>
                  formatCurrency(typeof v === "number" ? v : Number(v), locale)
                }
              />
              <Tooltip
                formatter={(value: number | string) =>
                  formatCurrency(typeof value === "number" ? value : Number(value), locale)
                }
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
