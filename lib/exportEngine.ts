import type { Category, Expense } from "./types";
import { formatCurrency, formatDate, todayISO } from "./format";

export type ExportFormat = "csv" | "json" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  startDate: string; // "" = no lower bound
  endDate: string; // "" = no upper bound
  categories: Category[]; // categories to include
}

export const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: "CSV",
  json: "JSON",
  pdf: "PDF",
};

export const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: "csv",
  json: "json",
  pdf: "pdf",
};

const FORMAT_MIME: Record<Exclude<ExportFormat, "pdf">, string> = {
  csv: "text/csv;charset=utf-8;",
  json: "application/json;charset=utf-8;",
};

export function filterForExport(expenses: Expense[], options: Pick<ExportOptions, "startDate" | "endDate" | "categories">): Expense[] {
  return expenses
    .filter((e) => options.categories.includes(e.category))
    .filter((e) => !options.startDate || e.date >= options.startDate)
    .filter((e) => !options.endDate || e.date <= options.endDate)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function suggestFilename(format: ExportFormat): string {
  return `expenses-export-${todayISO()}.${FORMAT_EXTENSIONS[format]}`;
}

export function ensureExtension(filename: string, format: ExportFormat): string {
  const ext = FORMAT_EXTENSIONS[format];
  const trimmed = filename.trim() || suggestFilename(format).replace(`.${ext}`, "");
  return trimmed.toLowerCase().endsWith(`.${ext}`) ? trimmed : `${trimmed}.${ext}`;
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildCsv(expenses: Expense[]): string {
  const header = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [e.date, e.category, e.amount.toFixed(2), e.description]);
  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function buildJson(expenses: Expense[]): string {
  const payload = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  return JSON.stringify({ exportedAt: new Date().toISOString(), count: payload.length, expenses: payload }, null, 2);
}

async function buildPdf(expenses: Expense[], options: ExportOptions): Promise<Blob> {
  // Loaded on demand so the PDF library (~150KB) never ships in the main
  // bundle for users who only ever export CSV or JSON.
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Expense Report", 40, 46);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const rangeLabel =
    options.startDate || options.endDate
      ? `Range: ${options.startDate ? formatDate(options.startDate) : "Start"} – ${
          options.endDate ? formatDate(options.endDate) : "Today"
        }`
      : "Range: All time";
  doc.text(`${rangeLabel}   ·   Generated ${new Date().toLocaleString()}`, 40, 62);

  autoTable(doc, {
    startY: 78,
    head: [["Date", "Category", "Amount", "Description"]],
    body: expenses.map((e) => [formatDate(e.date), e.category, formatCurrency(e.amount), e.description]),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [42, 120, 214], textColor: 255 },
    alternateRowStyles: { fillColor: [249, 249, 247] },
    columnStyles: { 2: { halign: "right" } },
    margin: { left: 40, right: 40 },
    foot: [["", "", "Total", formatCurrency(total)]],
    footStyles: { fillColor: [240, 239, 236], textColor: 20, fontStyle: "bold" },
  });

  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function runExport(expenses: Expense[], options: ExportOptions, filename: string): Promise<void> {
  if (options.format === "csv") {
    downloadBlob(new Blob([buildCsv(expenses)], { type: FORMAT_MIME.csv }), filename);
    return;
  }
  if (options.format === "json") {
    downloadBlob(new Blob([buildJson(expenses)], { type: FORMAT_MIME.json }), filename);
    return;
  }
  downloadBlob(await buildPdf(expenses, options), filename);
}
