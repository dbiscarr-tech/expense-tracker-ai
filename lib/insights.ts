import { CATEGORIES, type Category, type Expense } from "./types";
import { formatMonthLabel, monthKeyOf, todayISO } from "./format";
import { getTotalSpending } from "./stats";

export interface MonthOverMonth {
  currentTotal: number;
  previousTotal: number;
  changeAmount: number;
  changePercent: number | null; // null when there's no previous-month baseline to compare against
}

function shiftMonthKey(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthOverMonthChange(expenses: Expense[]): MonthOverMonth {
  const currentMonth = monthKeyOf(todayISO());
  const previousMonth = shiftMonthKey(currentMonth, -1);

  const currentTotal = getTotalSpending(expenses.filter((e) => monthKeyOf(e.date) === currentMonth));
  const previousTotal = getTotalSpending(expenses.filter((e) => monthKeyOf(e.date) === previousMonth));

  return {
    currentTotal,
    previousTotal,
    changeAmount: currentTotal - previousTotal,
    changePercent: previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : null,
  };
}

export function getAverageTransactionAmount(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  return getTotalSpending(expenses) / expenses.length;
}

export function getBiggestExpense(expenses: Expense[]): Expense | null {
  if (expenses.length === 0) return null;
  return expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0]);
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const DAY_FULL_NAMES: Record<(typeof DAY_LABELS)[number], string> = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

export interface DayOfWeekTotal {
  day: (typeof DAY_LABELS)[number];
  total: number;
}

export function getSpendingByDayOfWeek(expenses: Expense[]): DayOfWeekTotal[] {
  const totals = new Array(7).fill(0) as number[];
  for (const expense of expenses) {
    const [year, month, day] = expense.date.split("-").map(Number);
    const dow = new Date(year, month - 1, day).getDay();
    totals[dow] += expense.amount;
  }
  return DAY_LABELS.map((day, i) => ({ day, total: totals[i] }));
}

export function getBusiestDayOfWeek(expenses: Expense[]): DayOfWeekTotal | null {
  const totals = getSpendingByDayOfWeek(expenses).filter((d) => d.total > 0);
  if (totals.length === 0) return null;
  return totals.reduce((max, d) => (d.total > max.total ? d : max), totals[0]);
}

export interface CategoryMonthlyTrend {
  monthKey: string;
  label: string;
  [category: string]: string | number;
}

/**
 * Monthly totals broken down by category, for a stacked trend chart.
 * Each returned row has one numeric field per Category alongside monthKey/label.
 */
export function getCategoryMonthlyTrend(expenses: Expense[], monthsCount = 6): CategoryMonthlyTrend[] {
  const now = new Date();
  const months: CategoryMonthlyTrend[] = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const row: CategoryMonthlyTrend = { monthKey, label: formatMonthLabel(monthKey) };
    for (const category of CATEGORIES) row[category] = 0;
    months.push(row);
  }
  const byMonth = new Map(months.map((m) => [m.monthKey, m]));
  for (const expense of expenses) {
    const bucket = byMonth.get(monthKeyOf(expense.date));
    if (bucket) {
      bucket[expense.category] = (bucket[expense.category] as number) + expense.amount;
    }
  }
  return months;
}

export function getActiveCategories(expenses: Expense[]): Category[] {
  const active = new Set(expenses.map((e) => e.category));
  return CATEGORIES.filter((c) => active.has(c));
}
