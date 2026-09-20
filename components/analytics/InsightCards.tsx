import { CalendarHeart, Flame, Scale, TrendingDown, TrendingUp } from "lucide-react";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import {
  DAY_FULL_NAMES,
  getAverageTransactionAmount,
  getBiggestExpense,
  getBusiestDayOfWeek,
  getMonthOverMonthChange,
} from "@/lib/insights";

export function InsightCards({ expenses }: { expenses: Expense[] }) {
  const momChange = getMonthOverMonthChange(expenses);
  const avgTransaction = getAverageTransactionAmount(expenses);
  const biggest = getBiggestExpense(expenses);
  const busiestDay = getBusiestDayOfWeek(expenses);

  const isUp = momChange.changeAmount >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Month over month"
        value={
          momChange.changePercent === null
            ? formatCurrency(momChange.currentTotal)
            : `${isUp ? "+" : ""}${momChange.changePercent.toFixed(1)}%`
        }
        helper={
          momChange.changePercent === null
            ? "No prior month to compare yet"
            : `${formatCurrency(momChange.currentTotal)} this month vs ${formatCurrency(momChange.previousTotal)} last month`
        }
        icon={isUp ? TrendingUp : TrendingDown}
        accentColor={isUp ? "#eb6834" : "#1baf7a"}
      />
      <StatCard
        label="Avg. per transaction"
        value={formatCurrency(avgTransaction)}
        helper={`Across ${expenses.length} transaction${expenses.length === 1 ? "" : "s"}`}
        icon={Scale}
        accentColor="#4a3aa7"
      />
      <StatCard
        label="Biggest expense"
        value={biggest ? formatCurrency(biggest.amount) : "—"}
        helper={biggest ? `${biggest.category} · ${formatDate(biggest.date)}` : "No expenses yet"}
        icon={Flame}
        accentColor="#e87ba4"
      />
      <StatCard
        label="Busiest day"
        value={busiestDay ? `${DAY_FULL_NAMES[busiestDay.day]}s` : "—"}
        helper={busiestDay ? `${formatCurrency(busiestDay.total)} spent on ${DAY_FULL_NAMES[busiestDay.day]}s` : "No expenses yet"}
        icon={CalendarHeart}
        accentColor="#eda100"
      />
    </div>
  );
}
