import type { Expense } from "./types";
import { expensesToCsv } from "./csv";
import { formatCurrency, formatDate, todayISO } from "./format";

export type ExportFormat = "csv" | "json" | "pdf";

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

export function suggestFilename(format: ExportFormat): string {
  return `expenses-${todayISO()}.${FORMAT_EXTENSIONS[format]}`;
}

function buildJson(expenses: Expense[]): string {
  const payload = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), count: payload.length, expenses: payload },
    null,
    2
  );
}

async function buildPdf(expenses: Expense[]): Promise<Blob> {
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
  doc.text(`Generated ${new Date().toLocaleString()}`, 40, 62);

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

export async function runExport(expenses: Expense[], format: ExportFormat, filename: string): Promise<void> {
  if (format === "csv") {
    downloadBlob(new Blob([expensesToCsv(expenses)], { type: FORMAT_MIME.csv }), filename);
    return;
  }
  if (format === "json") {
    downloadBlob(new Blob([buildJson(expenses)], { type: FORMAT_MIME.json }), filename);
    return;
  }
  downloadBlob(await buildPdf(expenses), filename);
}
