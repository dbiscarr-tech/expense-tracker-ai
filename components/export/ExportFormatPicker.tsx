"use client";

import { FileJson, FileSpreadsheet, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ExportFormat } from "@/lib/exportEngine";

interface FormatOption {
  value: ExportFormat;
  label: string;
  description: string;
  icon: LucideIcon;
}

const OPTIONS: FormatOption[] = [
  { value: "csv", label: "CSV", description: "Spreadsheets, Excel", icon: FileSpreadsheet },
  { value: "json", label: "JSON", description: "APIs, developers", icon: FileJson },
  { value: "pdf", label: "PDF", description: "Sharing, printing", icon: FileText },
];

interface ExportFormatPickerProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

export function ExportFormatPicker({ value, onChange }: ExportFormatPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 text-center transition ${
              selected
                ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Icon className={`h-6 w-6 ${selected ? "text-blue-600" : "text-slate-400"}`} />
            <span className={`text-sm font-semibold ${selected ? "text-blue-900" : "text-slate-700"}`}>
              {option.label}
            </span>
            <span className="text-xs text-slate-500">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}
