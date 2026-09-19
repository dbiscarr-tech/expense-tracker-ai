"use client";

import { CATEGORIES, type Category } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";

interface ExportFiltersPanelProps {
  startDate: string;
  endDate: string;
  categories: Category[];
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onCategoriesChange: (categories: Category[]) => void;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500";

export function ExportFiltersPanel({
  startDate,
  endDate,
  categories,
  onStartDateChange,
  onEndDateChange,
  onCategoriesChange,
}: ExportFiltersPanelProps) {
  const allSelected = categories.length === CATEGORIES.length;

  function toggleCategory(category: Category) {
    if (categories.includes(category)) {
      onCategoriesChange(categories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...categories, category]);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="export-start" className="mb-1 block text-xs font-medium text-slate-500">
            From
          </label>
          <input
            id="export-start"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDateChange(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="export-end" className="mb-1 block text-xs font-medium text-slate-500">
            To
          </label>
          <input
            id="export-end"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Categories</span>
          <button
            type="button"
            onClick={() => onCategoriesChange(allSelected ? [] : [...CATEGORIES])}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const Icon = meta.icon;
            const selected = categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selected
                    ? "border-transparent"
                    : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                }`}
                style={selected ? { backgroundColor: meta.bg, color: meta.text } : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
