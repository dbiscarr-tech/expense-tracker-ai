"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Download } from "lucide-react";
import { Drawer } from "@/components/Drawer";
import { ExportFormatPicker } from "./ExportFormatPicker";
import { ExportFiltersPanel } from "./ExportFiltersPanel";
import { ExportPreviewTable } from "./ExportPreviewTable";
import { useToast } from "@/context/ToastContext";
import { CATEGORIES, type Category, type Expense } from "@/lib/types";
import { todayISO, formatCurrency } from "@/lib/format";
import {
  FORMAT_EXTENSIONS,
  ensureExtension,
  filterForExport,
  runExport,
  type ExportFormat,
} from "@/lib/exportEngine";

interface ExportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ExportDrawer({ isOpen, onClose, expenses }: ExportDrawerProps) {
  const { showToast } = useToast();
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categories, setCategories] = useState<Category[]>([...CATEGORIES]);
  const [filenameBase, setFilenameBase] = useState(`expenses-export-${todayISO()}`);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormat("csv");
      setStartDate("");
      setEndDate("");
      setCategories([...CATEGORIES]);
      setFilenameBase(`expenses-export-${todayISO()}`);
      setIsExporting(false);
    }
  }, [isOpen]);

  const filtered = useMemo(
    () => filterForExport(expenses, { startDate, endDate, categories }),
    [expenses, startDate, endDate, categories]
  );
  const totalAmount = useMemo(() => filtered.reduce((sum, e) => sum + e.amount, 0), [filtered]);

  async function handleExport() {
    if (filtered.length === 0 || isExporting) return;
    setIsExporting(true);
    const filename = ensureExtension(filenameBase, format);
    try {
      // A floor under the loading state so CSV/JSON (near-instant) don't
      // just flash; PDF genuinely needs the time to lazy-load its library.
      await Promise.all([delay(350), runExport(filtered, { format, startDate, endDate, categories }, filename)]);
      showToast(`Exported ${filtered.length} record${filtered.length === 1 ? "" : "s"} as ${filename}.`);
      onClose();
    } catch {
      showToast("Something went wrong while exporting. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Export data"
      description="Choose a format, filter records, and download."
      footer={
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{filtered.length}</span> record
            {filtered.length === 1 ? "" : "s"} · {formatCurrency(totalAmount)}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={filtered.length === 0 || isExporting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export {filtered.length > 0 ? filtered.length : ""}
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Format</h3>
          <ExportFormatPicker value={format} onChange={setFormat} />
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Filters</h3>
          <ExportFiltersPanel
            startDate={startDate}
            endDate={endDate}
            categories={categories}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onCategoriesChange={setCategories}
          />
        </section>

        <section>
          <label htmlFor="export-filename" className="mb-1.5 block text-sm font-semibold text-slate-900">
            Filename
          </label>
          <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500">
            <input
              id="export-filename"
              type="text"
              value={filenameBase}
              onChange={(e) => setFilenameBase(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none"
            />
            <span className="flex items-center whitespace-nowrap bg-slate-50 px-3 text-sm text-slate-500">
              .{FORMAT_EXTENSIONS[format]}
            </span>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Preview</h3>
            <span className="text-xs text-slate-500">
              {filtered.length} record{filtered.length === 1 ? "" : "s"} selected
            </span>
          </div>
          <ExportPreviewTable expenses={filtered} />
        </section>
      </div>
    </Drawer>
  );
}
