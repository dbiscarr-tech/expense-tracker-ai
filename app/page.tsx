"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useExpenses } from "@/context/ExpensesContext";
import { SummaryCards } from "@/components/SummaryCards";
import { CategoryChart } from "@/components/CategoryChart";
import { TrendChart } from "@/components/TrendChart";
import { EmptyState } from "@/components/EmptyState";
import { CategoryBadge } from "@/components/CategoryBadge";
import { DashboardSkeleton } from "@/components/Skeletons";
import { formatCurrency, formatDate } from "@/lib/format";
import { sortByDateDesc } from "@/lib/stats";

export default function DashboardPage() {
  const { expenses, isLoaded } = useExpenses();

  if (!isLoaded) {
    return <DashboardSkeleton />;
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState context="dashboard" />
      </div>
    );
  }

  const recent = sortByDateDesc(expenses).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader />
      <SummaryCards expenses={expenses} />

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

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent expenses</h2>
          <Link
            href="/expenses"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ul className="divide-y divide-slate-50">
          {recent.map((expense) => (
            <li key={expense.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <CategoryBadge category={expense.category} />
                <span className="truncate text-sm text-slate-700">{expense.description}</span>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
                <span className="text-sm font-semibold tabular-nums text-slate-900">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="text-sm text-slate-500">
        A quick overview of your spending and financial habits.
      </p>
    </div>
  );
}
