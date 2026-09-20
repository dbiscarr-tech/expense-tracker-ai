"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Expense } from "@/lib/types";
import { getActiveCategories, getCategoryMonthlyTrend } from "@/lib/insights";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

interface TooltipEntry {
  dataKey: string;
  value: number;
  color: string;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const nonZero = payload.filter((entry) => entry.value > 0);
  if (nonZero.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-semibold text-slate-900">{label}</p>
      <div className="space-y-0.5">
        {nonZero.map((entry) => (
          <p key={entry.dataKey} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.dataKey}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    </div>
  );
}

export function CategoryTrendChart({ expenses }: { expenses: Expense[] }) {
  const data = getCategoryMonthlyTrend(expenses, 6);
  const activeCategories = getActiveCategories(expenses);

  if (activeCategories.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No spending data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
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
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f9f9f7" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {activeCategories.map((category) => (
          <Bar
            key={category}
            dataKey={category}
            stackId="spend"
            fill={CATEGORY_META[category].color}
            radius={[0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
