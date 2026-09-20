import type { CategoryTotal } from "@/lib/stats";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

export function CategoryRankingList({ totals }: { totals: CategoryTotal[] }) {
  const maxTotal = totals[0]?.total ?? 0;

  return (
    <ol className="divide-y divide-slate-100">
      {totals.map((item, index) => {
        const meta = CATEGORY_META[item.category];
        const Icon = meta.icon;
        const barWidth = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
        return (
          <li key={item.category} className="flex items-center gap-4 px-5 py-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
              {index + 1}
            </span>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: meta.bg, color: meta.text }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-slate-900">{item.category}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                  {formatCurrency(item.total)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${barWidth}%`, backgroundColor: meta.color }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs text-slate-500">
                  {item.percent.toFixed(1)}%
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
