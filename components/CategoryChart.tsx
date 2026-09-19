"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Expense } from "@/lib/types";
import { getCategoryTotals } from "@/lib/stats";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

interface TooltipPayloadItem {
  payload: { category: string; total: number; percent: number };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const { category, total, percent } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-900">{category}</p>
      <p className="text-xs text-slate-500">
        {formatCurrency(total)} · {percent.toFixed(1)}%
      </p>
    </div>
  );
}

export function CategoryChart({ expenses }: { expenses: Expense[] }) {
  const data = getCategoryTotals(expenses).filter((c) => c.total > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No spending data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fill: "#898781", fontSize: 12 }}
          axisLine={{ stroke: "#c3c2b7" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={110}
          tick={{ fill: "#0b0b0b", fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f9f9f7" }} />
        <Bar dataKey="total" radius={[4, 4, 4, 4]} maxBarSize={22}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={CATEGORY_META[entry.category].color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
