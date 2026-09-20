"use client";

import { useMemo, useState } from "react";
import { useExpenses } from "@/context/ExpensesContext";
import { ExpenseFiltersBar } from "@/components/ExpenseFiltersBar";
import { ExpenseList } from "@/components/ExpenseList";
import { EmptyState } from "@/components/EmptyState";
import { ExpensesSkeleton } from "@/components/Skeletons";
import { ExportMenu } from "@/components/export/ExportMenu";
import { DEFAULT_FILTERS, type ExpenseFilters } from "@/lib/types";
import { filterExpenses, getTotalSpending, sortByDateDesc } from "@/lib/stats";
import { formatCurrency } from "@/lib/format";

export default function ExpensesPage() {
  const { expenses, isLoaded } = useExpenses();
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => sortByDateDesc(filterExpenses(expenses, filters)),
    [expenses, filters]
  );

  if (!isLoaded) {
    return <ExpensesSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">Browse, search, and manage all your expenses.</p>
        </div>
        <ExportMenu expenses={filtered} />
      </div>

      {expenses.length === 0 ? (
        <EmptyState context="expenses" />
      ) : (
        <>
          <ExpenseFiltersBar filters={filters} onChange={setFilters} />

          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              Showing {filtered.length} of {expenses.length} expenses
            </span>
            <span className="font-medium text-slate-700">
              Total: {formatCurrency(getTotalSpending(filtered))}
            </span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState context="expenses" />
          ) : (
            <ExpenseList
              key={`${filters.search}|${filters.category}|${filters.startDate}|${filters.endDate}`}
              expenses={filtered}
            />
          )}
        </>
      )}
    </div>
  );
}
