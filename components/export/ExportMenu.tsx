"use client";

import { useState } from "react";
import { ChevronDown, Download, FileJson, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Expense } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import { FORMAT_LABELS, runExport, suggestFilename, type ExportFormat } from "@/lib/exportEngine";

const FORMATS: ExportFormat[] = ["csv", "json", "pdf"];

const FORMAT_ICONS: Record<ExportFormat, LucideIcon> = {
  csv: FileSpreadsheet,
  json: FileJson,
  pdf: FileText,
};

interface ExportMenuProps {
  expenses: Expense[];
}

export function ExportMenu({ expenses }: ExportMenuProps) {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    setIsOpen(false);
    if (expenses.length === 0) {
      showToast("There are no expenses to export.", "error");
      return;
    }
    setPendingFormat(format);
    try {
      const filename = suggestFilename(format);
      await runExport(expenses, format, filename);
      showToast(`Exported ${expenses.length} expense${expenses.length === 1 ? "" : "s"} as ${FORMAT_LABELS[format]}.`);
    } catch {
      showToast("Something went wrong while exporting. Please try again.", "error");
    } finally {
      setPendingFormat(null);
    }
  }

  return (
    <div className="relative self-start sm:self-auto">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        disabled={pendingFormat !== null}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendingFormat ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {pendingFormat ? `Exporting ${FORMAT_LABELS[pendingFormat]}…` : "Export"}
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {FORMATS.map((format) => {
              const Icon = FORMAT_ICONS[format];
              return (
                <button
                  key={format}
                  role="menuitem"
                  type="button"
                  onClick={() => handleExport(format)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Icon className="h-4 w-4 text-slate-400" />
                  Export as {FORMAT_LABELS[format]}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
