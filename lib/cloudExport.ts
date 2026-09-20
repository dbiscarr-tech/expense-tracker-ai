import type { Category, Expense } from "./types";
import { CATEGORIES } from "./types";
import { formatCurrency, formatDate, todayISO } from "./format";

export type ExportFormat = "csv" | "json" | "pdf";
export type TemplateId = "tax-report" | "monthly-summary" | "category-analysis";
export type IntegrationId = "google-sheets" | "dropbox" | "onedrive" | "slack";
export type Frequency = "daily" | "weekly" | "monthly";
export type Permission = "view" | "edit";
export type Expiration = "never" | "7d" | "30d";

export interface ExportTemplate {
  id: TemplateId;
  name: string;
  description: string;
  format: ExportFormat;
}

export const TEMPLATES: ExportTemplate[] = [
  {
    id: "tax-report",
    name: "Tax Report",
    description: "Year-to-date expenses with category subtotals, formatted for filing.",
    format: "pdf",
  },
  {
    id: "monthly-summary",
    name: "Monthly Summary",
    description: "This month's spending with a category breakdown and running total.",
    format: "pdf",
  },
  {
    id: "category-analysis",
    name: "Category Analysis",
    description: "All-time records grouped by category, ready for a spreadsheet.",
    format: "csv",
  },
];

export function getTemplate(id: TemplateId): ExportTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export interface IntegrationMeta {
  id: IntegrationId;
  name: string;
  description: string;
}

export const INTEGRATIONS: IntegrationMeta[] = [
  { id: "google-sheets", name: "Google Sheets", description: "Keep a live spreadsheet in sync with your expenses." },
  { id: "dropbox", name: "Dropbox", description: "Save export files straight to a Dropbox folder." },
  { id: "onedrive", name: "OneDrive", description: "Back up exports to your Microsoft OneDrive." },
  { id: "slack", name: "Slack", description: "Post a spending summary to a channel on schedule." },
];

export interface IntegrationState {
  connectedAt: string | null;
  autoSync: boolean;
}

export type IntegrationsMap = Record<IntegrationId, IntegrationState>;

export const DEFAULT_INTEGRATIONS: IntegrationsMap = {
  "google-sheets": { connectedAt: null, autoSync: false },
  dropbox: { connectedAt: null, autoSync: false },
  onedrive: { connectedAt: null, autoSync: false },
  slack: { connectedAt: null, autoSync: false },
};

export interface ScheduleEntry {
  id: string;
  frequency: Frequency;
  templateId: TemplateId;
  destination: string;
  time: string;
  createdAt: string;
  nextRunAt: string;
  active: boolean;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  templateId: TemplateId;
  destination: string;
  recordCount: number;
  status: "completed" | "simulated";
}

export interface ShareLinkEntry {
  id: string;
  createdAt: string;
  permission: Permission;
  expiration: Expiration;
  url: string;
  templateId: TemplateId;
}

export function seedHistory(): HistoryEntry[] {
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };
  return [
    {
      id: "seed-1",
      timestamp: daysAgo(3),
      templateId: "monthly-summary",
      destination: "Downloaded",
      recordCount: 14,
      status: "completed",
    },
    {
      id: "seed-2",
      timestamp: daysAgo(9),
      templateId: "category-analysis",
      destination: "Email: you@example.com",
      recordCount: 22,
      status: "simulated",
    },
  ];
}

function dateRangeForTemplate(id: TemplateId): { startDate: string; endDate: string; label: string } {
  const today = new Date();
  if (id === "tax-report") {
    return {
      startDate: `${today.getFullYear()}-01-01`,
      endDate: todayISO(),
      label: `Jan 1 – ${formatDate(todayISO())}`,
    };
  }
  if (id === "monthly-summary") {
    const start = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
    return { startDate: start, endDate: todayISO(), label: "This month" };
  }
  return { startDate: "", endDate: "", label: "All time" };
}

function expensesForTemplate(expenses: Expense[], id: TemplateId): Expense[] {
  const { startDate, endDate } = dateRangeForTemplate(id);
  const filtered = expenses.filter((e) => (!startDate || e.date >= startDate) && (!endDate || e.date <= endDate));
  if (id === "category-analysis") {
    return [...filtered].sort((a, b) => a.category.localeCompare(b.category) || (a.date < b.date ? 1 : -1));
  }
  return [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function categorySubtotals(expenses: Expense[]): { category: Category; total: number }[] {
  const totals = new Map<Category, number>();
  for (const category of CATEGORIES) totals.set(category, 0);
  for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  return CATEGORIES.map((category) => ({ category, total: totals.get(category) ?? 0 })).filter((c) => c.total > 0);
}

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildCsv(expenses: Expense[]): string {
  const header = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [e.date, e.category, e.amount.toFixed(2), e.description]);
  const subtotals = categorySubtotals(expenses);
  const footer = [
    [],
    ["Category", "Subtotal"],
    ...subtotals.map((s) => [s.category, s.total.toFixed(2)]),
    ["Total", expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)],
  ];
  return [header, ...rows, ...footer].map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(",")).join("\n");
}

async function buildPdf(expenses: Expense[], template: ExportTemplate): Promise<Blob> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const { label } = dateRangeForTemplate(template.id);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(template.name, 40, 46);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`${label}   ·   Generated ${new Date().toLocaleString()}`, 40, 62);

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

  const subtotals = categorySubtotals(expenses);
  if (subtotals.length > 0) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    autoTable(doc, {
      startY: finalY + 24,
      head: [["Category breakdown", "Subtotal"]],
      body: subtotals.map((s) => [s.category, formatCurrency(s.total)]),
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [27, 175, 122], textColor: 255 },
      columnStyles: { 1: { halign: "right" } },
      margin: { left: 40, right: 40 },
      tableWidth: 260,
    });
  }

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

export interface QuickExportResult {
  filename: string;
  recordCount: number;
}

export async function runTemplateExport(expenses: Expense[], templateId: TemplateId): Promise<QuickExportResult> {
  const template = getTemplate(templateId);
  const scoped = expensesForTemplate(expenses, templateId);
  const filename = `${templateId}-${todayISO()}.${template.format}`;

  if (template.format === "csv") {
    downloadBlob(new Blob([buildCsv(scoped)], { type: "text/csv;charset=utf-8;" }), filename);
  } else {
    downloadBlob(await buildPdf(scoped, template), filename);
  }

  return { filename, recordCount: scoped.length };
}

export function templateRecordCount(expenses: Expense[], templateId: TemplateId): number {
  return expensesForTemplate(expenses, templateId).length;
}

export async function generateQrDataUrl(text: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(text, { width: 200, margin: 1, color: { dark: "#0b0b0b", light: "#ffffff" } });
}

export function generateShareUrl(): string {
  const id = Math.random().toString(36).slice(2, 10);
  return `https://expensetracker.app/shared/${id}`;
}

export function computeNextRun(frequency: Frequency, time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date();
  next.setHours(hours || 9, minutes || 0, 0, 0);
  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1);
  }
  if (frequency === "weekly") next.setDate(next.getDate() + 6);
  if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
  return next.toISOString();
}
