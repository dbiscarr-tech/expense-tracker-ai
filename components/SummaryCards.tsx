import { Wallet, CalendarDays, TrendingUp, Receipt } from "lucide-react";
import type { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { getCurrentMonthSpending, getTopCategory, getTotalSpending } from "@/lib/stats";
import { CATEGORY_META } from "@/lib/categories";
import { StatCard } from "./StatCard";

export function SummaryCards({ expenses }: { expenses: Expense[] }) {
  const total = getTotalSpending(expenses);
  const monthTotal = getCurrentMonthSpending(expenses);
  const topCategory = getTopCategory(expenses);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total spending"
        value={formatCurrency(total)}
        helper="All time"
        icon={Wallet}
        accentColor="#2a78d6"
      />
      <StatCard
        label="This month"
        value={formatCurrency(monthTotal)}
        helper={new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        icon={CalendarDays}
        accentColor="#eb6834"
      />
      <StatCard
        label="Top category"
        value={topCategory ? topCategory.category : "—"}
        helper={topCategory ? `${formatCurrency(topCategory.total)} spent` : "No expenses yet"}
        icon={TrendingUp}
        accentColor={topCategory ? CATEGORY_META[topCategory.category].color : "#1baf7a"}
      />
      <StatCard
        label="Transactions"
        value={String(expenses.length)}
        helper="Total recorded"
        icon={Receipt}
        accentColor="#4a3aa7"
      />
    </div>
  );
}
