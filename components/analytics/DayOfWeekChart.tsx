"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Expense } from "@/lib/types";
import { getSpendingByDayOfWeek } from "@/lib/insights";
import { formatCurrency } from "@/lib/format";

interface TooltipPayloadItem {
  payload: { day: string; total: number };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const { day, total } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-900">{day}</p>
      <p className="text-xs text-slate-500">{formatCurrency(total)}</p>
    </div>
  );
}

export function DayOfWeekChart({ expenses }: { expenses: Expense[] }) {
  const data = getSpendingByDayOfWeek(expenses);
  const hasData = data.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        No spending data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis
          dataKey="day"
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
        <Bar dataKey="total" fill="#1baf7a" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
