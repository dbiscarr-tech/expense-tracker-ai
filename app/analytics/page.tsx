"use client";

import { useExpenses } from "@/context/ExpensesContext";
import { EmptyState } from "@/components/EmptyState";
import { AnalyticsSkeleton } from "@/components/Skeletons";
import { CategoryChart } from "@/components/CategoryChart";
import { TrendChart } from "@/components/TrendChart";
import { InsightCards } from "@/components/analytics/InsightCards";
import { CategoryTrendChart } from "@/components/analytics/CategoryTrendChart";
import { DayOfWeekChart } from "@/components/analytics/DayOfWeekChart";

export default function AnalyticsPage() {
  const { expenses, isLoaded } = useExpenses();

  if (!isLoaded) {
    return <AnalyticsSkeleton />;
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState context="analytics" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />
      <InsightCards expenses={expenses} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Spending by category</h2>
          <p className="mb-4 text-xs text-slate-500">All-time breakdown</p>
          <CategoryChart expenses={expenses} />
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Monthly trend</h2>
          <p className="mb-4 text-xs text-slate-500">Last 6 months</p>
          <TrendChart expenses={expenses} />
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Category trend</h2>
        <p className="mb-4 text-xs text-slate-500">Monthly spending, broken down by category</p>
        <CategoryTrendChart expenses={expenses} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Spending by day of week</h2>
        <p className="mb-4 text-xs text-slate-500">All-time totals, grouped by weekday</p>
        <DayOfWeekChart expenses={expenses} />
      </section>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
      <p className="text-sm text-slate-500">
        Deeper insights into your spending trends and habits.
      </p>
    </div>
  );
}
