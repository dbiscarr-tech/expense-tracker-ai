"use client";

import { Search, X } from "lucide-react";
import { CATEGORIES, DEFAULT_FILTERS, type ExpenseFilters } from "@/lib/types";

interface ExpenseFiltersBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}

const inputClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500";

export function ExpenseFiltersBar({ filters, onChange }: ExpenseFiltersBarProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "All" ||
    filters.startDate !== "" ||
    filters.endDate !== "";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex-1 min-w-[180px]">
        <label htmlFor="search" className="mb-1 block text-xs font-medium text-slate-500">
          Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="search"
            type="text"
            placeholder="Search description..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className={`${inputClass} w-full pl-8`}
          />
        </div>
      </div>

      <div className="min-w-[150px]">
        <label htmlFor="category" className="mb-1 block text-xs font-medium text-slate-500">
          Category
        </label>
        <select
          id="category"
          value={filters.category}
          onChange={(e) =>
            onChange({ ...filters, category: e.target.value as ExpenseFilters["category"] })
          }
          className={`${inputClass} w-full`}
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[140px]">
        <label htmlFor="startDate" className="mb-1 block text-xs font-medium text-slate-500">
          From
        </label>
        <input
          id="startDate"
          type="date"
          value={filters.startDate}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
          className={`${inputClass} w-full`}
        />
      </div>

      <div className="min-w-[140px]">
        <label htmlFor="endDate" className="mb-1 block text-xs font-medium text-slate-500">
          To
        </label>
        <input
          id="endDate"
          type="date"
          value={filters.endDate}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
          className={`${inputClass} w-full`}
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  );
}
