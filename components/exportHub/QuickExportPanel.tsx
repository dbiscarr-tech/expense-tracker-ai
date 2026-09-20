"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Expense } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import { TEMPLATES, runTemplateExport, templateRecordCount, type HistoryEntry, type TemplateId } from "@/lib/cloudExport";

const FORMAT_ICON: Record<string, LucideIcon> = { csv: FileSpreadsheet, pdf: FileText };

interface QuickExportPanelProps {
  expenses: Expense[];
  onExported: (entry: HistoryEntry) => void;
}

export function QuickExportPanel({ expenses, onExported }: QuickExportPanelProps) {
  const { showToast } = useToast();
  const [pendingId, setPendingId] = useState<TemplateId | null>(null);

  async function handleExport(templateId: TemplateId) {
    if (pendingId) return;
    setPendingId(templateId);
    try {
      const { filename, recordCount } = await runTemplateExport(expenses, templateId);
      onExported({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        templateId,
        destination: "Downloaded",
        recordCount,
        status: "completed",
      });
      showToast(`${filename} downloaded (${recordCount} records).`);
    } catch {
      showToast("Export failed. Please try again.", "error");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {TEMPLATES.map((template) => {
        const Icon = FORMAT_ICON[template.format];
        const count = templateRecordCount(expenses, template.id);
        const isPending = pendingId === template.id;
        return (
          <div
            key={template.id}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {template.format}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">{template.name}</h3>
            <p className="mt-1 flex-1 text-xs text-slate-500">{template.description}</p>
            <p className="mt-3 text-xs text-slate-400">{count} record{count === 1 ? "" : "s"} included</p>
            <button
              onClick={() => handleExport(template.id)}
              disabled={isPending || count === 0}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Export
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
