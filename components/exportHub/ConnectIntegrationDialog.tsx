"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/Modal";
import type { IntegrationMeta } from "@/lib/cloudExport";

interface ConnectIntegrationDialogProps {
  integration: IntegrationMeta | null;
  onClose: () => void;
  onConfirm: (id: IntegrationMeta["id"]) => void;
}

const MOCK_PERMISSIONS = [
  "Read your expense summaries",
  "Create and update a spreadsheet or file on your behalf",
  "Sync new exports automatically (if enabled)",
];

export function ConnectIntegrationDialog({ integration, onClose, onConfirm }: ConnectIntegrationDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  if (!integration) return null;

  async function handleAuthorize() {
    setIsConnecting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    onConfirm(integration!.id);
    setIsConnecting(false);
  }

  return (
    <Modal isOpen={!!integration} onClose={onClose} title={`Connect ${integration.name}`}>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        This is a simulated authorization screen for demo purposes. No real account is contacted and
        nothing leaves this browser.
      </div>

      <p className="mt-4 text-sm text-slate-600">
        <span className="font-medium text-slate-900">ExpenseTracker</span> would like to:
      </p>
      <ul className="mt-2 space-y-2">
        {MOCK_PERMISSIONS.map((permission) => (
          <li key={permission} className="flex items-start gap-2 text-sm text-slate-600">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            {permission}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAuthorize}
          disabled={isConnecting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
            </>
          ) : (
            "Simulate authorization"
          )}
        </button>
      </div>
    </Modal>
  );
}
