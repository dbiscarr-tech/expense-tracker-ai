"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { useExpenses } from "@/context/ExpensesContext";
import { useExpenseModal } from "@/context/ExpenseModalContext";
import { useToast } from "@/context/ToastContext";
import { CategoryBadge } from "./CategoryBadge";
import { ConfirmDialog } from "./ConfirmDialog";

const PAGE_SIZE = 10;

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const { deleteExpense } = useExpenses();
  const { openEditModal } = useExpenseModal();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = expenses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteExpense(pendingDelete.id);
    showToast("Expense deleted.");
    setPendingDelete(null);
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((expense) => (
              <tr key={expense.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(expense.date)}</td>
                <td className="px-4 py-3">
                  <CategoryBadge category={expense.category} />
                </td>
                <td className="px-4 py-3 text-slate-800">{expense.description}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(expense)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      aria-label={`Edit ${expense.description}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPendingDelete(expense)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${expense.description}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {pageItems.map((expense) => (
          <div key={expense.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <CategoryBadge category={expense.category} />
              <span className="font-semibold tabular-nums text-slate-900">
                {formatCurrency(expense.amount)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-800">{expense.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">{formatDate(expense.date)}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(expense)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                  aria-label={`Edit ${expense.description}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPendingDelete(expense)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete ${expense.description}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {currentPage} of {totalPages} · {expenses.length} expenses
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete expense"
        message={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.description}" (${formatCurrency(
                pendingDelete.amount
              )})? This action cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
