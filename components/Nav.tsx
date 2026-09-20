"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, ListTree, Plus, Wallet } from "lucide-react";
import { useExpenseModal } from "@/context/ExpenseModalContext";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: ListTree },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Nav() {
  const pathname = usePathname();
  const { openAddModal } = useExpenseModal();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Wallet className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">ExpenseTracker</span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
                  active
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 sm:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>
      </div>
    </header>
  );
}
