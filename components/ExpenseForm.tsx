"use client";

import { useState, type FormEvent } from "react";
import { CATEGORIES, type Category, type Expense, type ExpenseInput } from "@/lib/types";
import { todayISO } from "@/lib/format";
import { CATEGORY_META } from "@/lib/categories";

interface ExpenseFormProps {
  initialExpense?: Expense | null;
  onSubmit: (input: ExpenseInput) => void;
  onCancel: () => void;
}

interface FormState {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

interface FormErrors {
  date?: string;
  amount?: string;
  description?: string;
}

function toFormState(expense?: Expense | null): FormState {
  if (expense) {
    return {
      date: expense.date,
      amount: String(expense.amount),
      category: expense.category,
      description: expense.description,
    };
  }
  return { date: todayISO(), amount: "", category: "Food", description: "" };
}

export function ExpenseForm({ initialExpense, onSubmit, onCancel }: ExpenseFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialExpense));
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(state: FormState): FormErrors {
    const next: FormErrors = {};
    if (!state.date) {
      next.date = "Date is required.";
    }
    const amountNum = Number(state.amount);
    if (!state.amount.trim()) {
      next.amount = "Amount is required.";
    } else if (Number.isNaN(amountNum) || amountNum <= 0) {
      next.amount = "Enter an amount greater than 0.";
    } else if (!/^\d+(\.\d{1,2})?$/.test(state.amount.trim())) {
      next.amount = "Use up to 2 decimal places.";
    }
    if (!state.description.trim()) {
      next.description = "Description is required.";
    } else if (state.description.trim().length < 2) {
      next.description = "Description is too short.";
    } else if (state.description.trim().length > 200) {
      next.description = "Description must be under 200 characters.";
    }
    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      date: form.date,
      amount: Math.round(Number(form.amount) * 100) / 100,
      category: form.category,
      description: form.description.trim(),
    });
  }

  const inputClass =
    "w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500";
  const errorInputClass = "border-red-300 focus:ring-red-500/30 focus:border-red-500";
  const normalInputClass = "border-slate-300";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={form.date}
          max={todayISO()}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className={`${inputClass} ${errors.date ? errorInputClass : normalInputClass}`}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? "date-error" : undefined}
        />
        {errors.date && (
          <p id="date-error" className="mt-1 text-sm text-red-600">
            {errors.date}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium text-slate-700">
          Amount
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            $
          </span>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className={`${inputClass} pl-7 ${errors.amount ? errorInputClass : normalInputClass}`}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "amount-error" : undefined}
          />
        </div>
        {errors.amount && (
          <p id="amount-error" className="mt-1 text-sm text-red-600">
            {errors.amount}
          </p>
        )}
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Category</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const Icon = meta.icon;
            const selected = form.category === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category }))}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition ${
                  selected
                    ? "border-transparent shadow-sm ring-2 ring-offset-1"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                style={
                  selected
                    ? {
                        backgroundColor: meta.bg,
                        color: meta.text,
                        // ring color matches category color
                        boxShadow: `0 0 0 2px ${meta.color}55`,
                      }
                    : undefined
                }
              >
                <Icon className="h-4 w-4" style={selected ? { color: meta.color } : undefined} />
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <input
          id="description"
          type="text"
          placeholder="e.g. Groceries at the farmers market"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={`${inputClass} ${errors.description ? errorInputClass : normalInputClass}`}
          maxLength={200}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {initialExpense ? "Save changes" : "Add expense"}
        </button>
      </div>
    </form>
  );
}
