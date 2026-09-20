"use client";

import { useState } from "react";
import { Copy, Link2, Loader2, QrCode, Trash2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import type { Expense } from "@/lib/types";
import {
  TEMPLATES,
  generateQrDataUrl,
  generateShareUrl,
  type Expiration,
  type Permission,
  type ShareLinkEntry,
  type TemplateId,
} from "@/lib/cloudExport";

interface SharingPanelProps {
  expenses: Expense[];
  shareLinks: ShareLinkEntry[];
  onChange: (updater: ShareLinkEntry[] | ((prev: ShareLinkEntry[]) => ShareLinkEntry[])) => void;
}

const EXPIRATION_LABEL: Record<Expiration, string> = { never: "Never expires", "7d": "Expires in 7 days", "30d": "Expires in 30 days" };

export function SharingPanel({ shareLinks, onChange }: SharingPanelProps) {
  const { showToast } = useToast();
  const [templateId, setTemplateId] = useState<TemplateId>(TEMPLATES[0].id);
  const [permission, setPermission] = useState<Permission>("view");
  const [expiration, setExpiration] = useState<Expiration>("7d");
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCache, setQrCache] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    const url = generateShareUrl();
    const id = crypto.randomUUID();
    const qr = await generateQrDataUrl(url);
    const entry: ShareLinkEntry = {
      id,
      createdAt: new Date().toISOString(),
      permission,
      expiration,
      url,
      templateId,
    };
    onChange((prev) => [entry, ...prev]);
    setQrCache((prev) => ({ ...prev, [id]: qr }));
    setExpandedId(id);
    setIsGenerating(false);
    showToast("Share link generated. (Demo link — does not resolve to a real page.)");
  }

  async function toggleQr(entry: ShareLinkEntry) {
    if (expandedId === entry.id) {
      setExpandedId(null);
      return;
    }
    if (!qrCache[entry.id]) {
      const qr = await generateQrDataUrl(entry.url);
      setQrCache((prev) => ({ ...prev, [entry.id]: qr }));
    }
    setExpandedId(entry.id);
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard.");
    } catch {
      showToast("Couldn't copy the link.", "error");
    }
  }

  function revoke(id: string) {
    onChange((prev) => prev.filter((l) => l.id !== id));
    if (expandedId === id) setExpandedId(null);
    showToast("Share link revoked.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Create a shareable link</h2>
        <p className="mt-1 text-xs text-slate-500">
          Demo links for illustration — they don&apos;t resolve to a real page, but the QR code is real and
          scannable.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Content</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value as TemplateId)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Permission</label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as Permission)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Expiration</label>
            <select
              value={expiration}
              onChange={(e) => setExpiration(e.target.value as Expiration)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="never">Never</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" /> Generate link
            </>
          )}
        </button>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Shared links</h2>
        {shareLinks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center text-sm text-slate-400">
            No share links yet.
          </div>
        ) : (
          <div className="space-y-3">
            {shareLinks.map((link) => (
              <div key={link.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-blue-700">{link.url}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {TEMPLATES.find((t) => t.id === link.templateId)?.name} ·{" "}
                      {link.permission === "view" ? "View only" : "Can edit"} · {EXPIRATION_LABEL[link.expiration]}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => toggleQr(link)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Show QR code"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => copyLink(link.url)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Copy link"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => revoke(link.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Revoke link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expandedId === link.id && qrCache[link.id] && (
                  <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCache[link.id]} alt="QR code for share link" className="h-28 w-28 rounded-lg border border-slate-200" />
                    <p className="text-xs text-slate-500">
                      Scan to open the demo link on another device. (It won&apos;t resolve to a real page —
                      this illustrates what sharing would look like.)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
