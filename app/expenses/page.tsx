"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useExpenses } from "@/context/ExpensesContext";
import { useToast } from "@/context/ToastContext";
import { ExpenseFiltersBar } from "@/components/ExpenseFiltersBar";
import { ExpenseList } from "@/components/ExpenseList";
import { EmptyState } from "@/components/EmptyState";
import { ExpensesSkeleton } from "@/components/Skeletons";
import { DEFAULT_FILTERS, type ExpenseFilters } from "@/lib/types";
import { filterExpenses, getTotalSpending, sortByDateDesc } from "@/lib/stats";
import { formatCurrency } from "@/lib/format";
import { downloadCsv, expensesToCsv } from "@/lib/csv";

export default function ExpensesPage() {
  const { expenses, isLoaded } = useExpenses();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => sortByDateDesc(filterExpenses(expenses, filters)),
    [expenses, filters]
  );

  if (!isLoaded) {
    return <ExpensesSkeleton />;
  }

  function handleExport() {
    if (filtered.length === 0) {
      showToast("There are no expenses to export.", "error");
      return;
    }
    const csv = expensesToCsv(filtered);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`expenses-${date}.csv`, csv);
    showToast(`Exported ${filtered.length} expense${filtered.length === 1 ? "" : "s"} to CSV.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">Browse, search, and manage all your expenses.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-auto"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
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
