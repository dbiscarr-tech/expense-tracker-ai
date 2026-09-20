import { CATEGORIES, type Category, type Expense, type ExpenseFilters } from "./types";
import { formatMonthLabel, monthKeyOf, todayISO } from "./format";

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  const search = filters.search.trim().toLowerCase();
  return expenses.filter((expense) => {
    if (filters.category !== "All" && expense.category !== filters.category) {
      return false;
    }
    if (filters.startDate && expense.date < filters.startDate) {
      return false;
    }
    if (filters.endDate && expense.date > filters.endDate) {
      return false;
    }
    if (search && !expense.description.toLowerCase().includes(search)) {
      return false;
    }
    return true;
  });
}

export function sortByDateDesc(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

export function getTotalSpending(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getCurrentMonthSpending(expenses: Expense[]): number {
  const currentMonth = monthKeyOf(todayISO());
  return getTotalSpending(expenses.filter((e) => monthKeyOf(e.date) === currentMonth));
}

export interface CategoryTotal {
  category: Category;
  total: number;
  percent: number;
}

export function getCategoryTotals(expenses: Expense[]): CategoryTotal[] {
  const total = getTotalSpending(expenses);
  const totals = new Map<Category, number>();
  for (const category of CATEGORIES) totals.set(category, 0);
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }
  return CATEGORIES.map((category) => {
    const catTotal = totals.get(category) ?? 0;
    return {
      category,
      total: catTotal,
      percent: total > 0 ? (catTotal / total) * 100 : 0,
    };
  }).sort((a, b) => b.total - a.total);
}

export function getTopCategory(expenses: Expense[]): CategoryTotal | null {
  const totals = getCategoryTotals(expenses).filter((c) => c.total > 0);
  return totals[0] ?? null;
}

export interface VendorTotal {
  vendor: string;
  total: number;
  percent: number;
  count: number;
}

// Note: the data model has no dedicated "vendor" field. We derive a vendor
// identity from the free-text `description` field, normalized by trimming
// whitespace and lowercasing for grouping purposes, while displaying the
// first-seen original casing/spacing for readability.
export function getTopVendors(expenses: Expense[], limit?: number): VendorTotal[] {
  const total = getTotalSpending(expenses);
  const totals = new Map<string, { display: string; total: number; count: number }>();

  for (const expense of expenses) {
    const trimmed = expense.description.trim();
    const key = trimmed.toLowerCase();
    if (!key) continue;
    const existing = totals.get(key);
    if (existing) {
      existing.total += expense.amount;
      existing.count += 1;
    } else {
      totals.set(key, { display: trimmed, total: expense.amount, count: 1 });
    }
  }

  const vendors = Array.from(totals.values())
    .map(({ display, total: vendorTotal, count }) => ({
      vendor: display,
      total: vendorTotal,
      percent: total > 0 ? (vendorTotal / total) * 100 : 0,
      count,
    }))
    .sort((a, b) => b.total - a.total);

  return typeof limit === "number" ? vendors.slice(0, limit) : vendors;
}

export interface MonthlyTotal {
  monthKey: string;
  label: string;
  total: number;
}

export function getMonthlyTrend(expenses: Expense[], monthsCount = 6): MonthlyTotal[] {
  const now = new Date();
  const months: MonthlyTotal[] = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ monthKey, label: formatMonthLabel(monthKey), total: 0 });
  }
  const byMonth = new Map(months.map((m) => [m.monthKey, m]));
  for (const expense of expenses) {
    const key = monthKeyOf(expense.date);
    const bucket = byMonth.get(key);
    if (bucket) bucket.total += expense.amount;
  }
  return months;
}
