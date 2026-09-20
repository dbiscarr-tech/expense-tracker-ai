"use client";

import { useExpenses } from "@/context/ExpensesContext";
import { CategoryRankingList } from "@/components/CategoryRankingList";
import { EmptyState } from "@/components/EmptyState";
import { CategoriesSkeleton } from "@/components/Skeletons";
import { formatCurrency } from "@/lib/format";
import { getCategoryTotals, getTotalSpending } from "@/lib/stats";

export default function CategoriesPage() {
  const { expenses, isLoaded } = useExpenses();

  if (!isLoaded) {
    return <CategoriesSkeleton />;
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState context="categories" />
      </div>
    );
  }

  const totals = getCategoryTotals(expenses).filter((c) => c.total > 0);
  const total = getTotalSpending(expenses);

  return (
    <div className="space-y-6">
      <PageHeader />

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Ranked by total spend</h2>
          <span className="text-sm font-medium text-slate-700">
            Total: {formatCurrency(total)}
          </span>
        </div>
        <CategoryRankingList totals={totals} />
      </section>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Top Categories</h1>
      <p className="text-sm text-slate-500">
        See which categories account for the most of your spending.
      </p>
    </div>
  );
}
