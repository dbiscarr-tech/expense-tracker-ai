"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import type { Expense } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import { TEMPLATES, templateRecordCount, type HistoryEntry, type TemplateId } from "@/lib/cloudExport";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailExportPanelProps {
  expenses: Expense[];
  onExported: (entry: HistoryEntry) => void;
}

type Status = "idle" | "sending" | "sent";

export function EmailExportPanel({ expenses, onExported }: EmailExportPanelProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>(TEMPLATES[0].id);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSend() {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setStatus("sending");
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const recordCount = templateRecordCount(expenses, templateId);
    onExported({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      templateId,
      destination: `Email: ${email.trim()}`,
      recordCount,
      status: "simulated",
    });
    setStatus("sent");
    showToast(`Simulated: export queued for ${email.trim()}.`);
  }

  return (
    <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Email an export</h2>
          <p className="text-xs text-slate-500">
            This is a demo simulation — no email is actually sent, but the flow is fully functional.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="recipient" className="mb-1 block text-xs font-medium text-slate-500">
            Recipient
          </label>
          <input
            id="recipient"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "sent") setStatus("idle");
            }}
            className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
              error ? "border-red-300" : "border-slate-300"
            }`}
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <div>
          <label htmlFor="template" className="mb-1 block text-xs font-medium text-slate-500">
            Template
          </label>
          <select
            id="template"
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value as TemplateId);
              if (status === "sent") setStatus("idle");
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.format.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="mb-1 block text-xs font-medium text-slate-500">
            Message <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="message"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a note for the recipient..."
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={status === "sending"}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : status === "sent" ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Sent
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send export
            </>
          )}
        </button>
      </div>
    </div>
  );
}
