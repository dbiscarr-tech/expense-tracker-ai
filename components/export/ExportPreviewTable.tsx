import { Inbox } from "lucide-react";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { CategoryBadge } from "@/components/CategoryBadge";

const PREVIEW_LIMIT = 6;

export function ExportPreviewTable({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-10 text-center">
        <Inbox className="h-6 w-6 text-slate-300" />
        <p className="text-sm text-slate-500">No records match these filters.</p>
      </div>
    );
  }

  const preview = expenses.slice(0, PREVIEW_LIMIT);
  const remaining = expenses.length - preview.length;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Description</th>
            <th className="px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {preview.map((expense) => (
            <tr key={expense.id} className="border-b border-slate-50 last:border-0">
              <td className="whitespace-nowrap px-3 py-2 text-slate-600">{formatDate(expense.date)}</td>
              <td className="px-3 py-2">
                <CategoryBadge category={expense.category} />
              </td>
              <td className="max-w-[160px] truncate px-3 py-2 text-slate-700">{expense.description}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-medium tabular-nums text-slate-900">
                {formatCurrency(expense.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {remaining > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-3 py-2 text-center text-xs text-slate-500">
          + {remaining} more record{remaining === 1 ? "" : "s"} in this export
        </div>
      )}
    </div>
  );
}
