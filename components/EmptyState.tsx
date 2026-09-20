"use client";

import { PackageOpen, Plus, Sparkles } from "lucide-react";
import { useExpenseModal } from "@/context/ExpenseModalContext";
import { useExpenses } from "@/context/ExpensesContext";
import { useToast } from "@/context/ToastContext";

export function EmptyState({
  context = "dashboard",
}: {
  context?: "dashboard" | "expenses" | "vendors";
}) {
  const { openAddModal } = useExpenseModal();
  const { loadSampleData } = useExpenses();
  const { showToast } = useToast();

  function handleSampleData() {
    loadSampleData();
    showToast("Sample data loaded.");
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
        <PackageOpen className="h-7 w-7 text-blue-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {context === "dashboard"
          ? "No expenses yet"
          : context === "vendors"
            ? "No vendors yet"
            : "No expenses found"}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        {context === "dashboard"
          ? "Start tracking your spending by adding your first expense, or explore the app with sample data."
          : context === "vendors"
            ? "Add an expense to start seeing where you spend the most."
            : "Try adjusting your filters, or add a new expense to get started."}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add expense
        </button>
        {context === "dashboard" && (
          <button
            onClick={handleSampleData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Sparkles className="h-4 w-4" />
            Load sample data
          </button>
        )}
      </div>
    </div>
  );
}
