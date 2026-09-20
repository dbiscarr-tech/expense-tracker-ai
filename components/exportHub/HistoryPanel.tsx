"use client";

import { useState } from "react";
import { CheckCircle2, History as HistoryIcon, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import type { Expense } from "@/lib/types";
import { getTemplate, runTemplateExport, type HistoryEntry } from "@/lib/cloudExport";

interface HistoryPanelProps {
  history: HistoryEntry[];
  expenses: Expense[];
  onExported: (entry: HistoryEntry) => void;
}

export function HistoryPanel({ history, expenses, onExported }: HistoryPanelProps) {
  const { showToast } = useToast();
  const [repeatingId, setRepeatingId] = useState<string | null>(null);

  async function handleRepeat(entry: HistoryEntry) {
    if (!entry.destination.startsWith("Downloaded")) {
      showToast("This entry can't be re-run automatically in the demo, but you can export it again from Quick Export.");
      return;
    }
    setRepeatingId(entry.id);
    try {
      const { filename, recordCount } = await runTemplateExport(expenses, entry.templateId);
      onExported({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        templateId: entry.templateId,
        destination: "Downloaded",
        recordCount,
        status: "completed",
      });
      showToast(`Re-exported as ${filename}.`);
    } finally {
      setRepeatingId(null);
    }
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
        <HistoryIcon className="h-6 w-6 text-slate-300" />
        <p className="text-sm text-slate-500">No export activity yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Template</th>
            <th className="px-4 py-3">Destination</th>
            <th className="px-4 py-3">Records</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id} className="border-b border-slate-50 last:border-0">
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {new Date(entry.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-slate-800">{getTemplate(entry.templateId).name}</td>
              <td className="px-4 py-3 text-slate-600">{entry.destination}</td>
              <td className="px-4 py-3 text-slate-600">{entry.recordCount}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    entry.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {entry.status === "completed" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {entry.status === "completed" ? "Completed" : "Simulated"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleRepeat(entry)}
                  disabled={repeatingId === entry.id}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                >
                  {repeatingId === entry.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Repeat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
