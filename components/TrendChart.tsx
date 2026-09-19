"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Expense } from "@/lib/types";
import { getMonthlyTrend } from "@/lib/stats";
import { formatCurrency } from "@/lib/format";

interface TooltipPayloadItem {
  payload: { label: string; total: number };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const { label, total } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">{formatCurrency(total)}</p>
    </div>
  );
}

export function TrendChart({ expenses }: { expenses: Expense[] }) {
  const data = getMonthlyTrend(expenses, 6);
  const hasData = data.some((m) => m.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No spending data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#898781", fontSize: 12 }}
          axisLine={{ stroke: "#c3c2b7" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fill: "#898781", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#eaf2fc" }} />
        <Bar dataKey="total" fill="#2a78d6" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
