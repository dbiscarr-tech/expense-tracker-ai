"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Expense, ExpenseInput } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { ExpenseForm } from "@/components/ExpenseForm";
import { useExpenses } from "./ExpensesContext";
import { useToast } from "./ToastContext";

interface ExpenseModalContextValue {
  openAddModal: () => void;
  openEditModal: (expense: Expense) => void;
}

const ExpenseModalContext = createContext<ExpenseModalContextValue | null>(null);

export function ExpenseModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { addExpense, updateExpense } = useExpenses();
  const { showToast } = useToast();

  const openAddModal = useCallback(() => {
    setEditingExpense(null);
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  function handleSubmit(input: ExpenseInput) {
    if (editingExpense) {
      updateExpense(editingExpense.id, input);
      showToast("Expense updated successfully.");
    } else {
      addExpense(input);
      showToast("Expense added successfully.");
    }
    setIsOpen(false);
  }

  return (
    <ExpenseModalContext.Provider value={{ openAddModal, openEditModal }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={editingExpense ? "Edit expense" : "Add expense"}
      >
        <ExpenseForm
          initialExpense={editingExpense}
          onSubmit={handleSubmit}
          onCancel={close}
        />
      </Modal>
    </ExpenseModalContext.Provider>
  );
}

export function useExpenseModal(): ExpenseModalContextValue {
  const ctx = useContext(ExpenseModalContext);
  if (!ctx) {
    throw new Error("useExpenseModal must be used within an ExpenseModalProvider");
  }
  return ctx;
}
