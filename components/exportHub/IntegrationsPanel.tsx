"use client";

import { useState } from "react";
import { Box, Cloud, MessageSquare, Sheet, Unplug } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { formatRelativeTime } from "@/lib/format";
import { INTEGRATIONS, type IntegrationId, type IntegrationsMap, type IntegrationMeta } from "@/lib/cloudExport";
import { ConnectIntegrationDialog } from "./ConnectIntegrationDialog";

const ICONS: Record<IntegrationId, LucideIcon> = {
  "google-sheets": Sheet,
  dropbox: Box,
  onedrive: Cloud,
  slack: MessageSquare,
};

interface IntegrationsPanelProps {
  integrations: IntegrationsMap;
  onChange: (updater: IntegrationsMap | ((prev: IntegrationsMap) => IntegrationsMap)) => void;
}

export function IntegrationsPanel({ integrations, onChange }: IntegrationsPanelProps) {
  const { showToast } = useToast();
  const [dialogTarget, setDialogTarget] = useState<IntegrationMeta | null>(null);

  function handleConnected(id: IntegrationId) {
    onChange((prev) => ({ ...prev, [id]: { connectedAt: new Date().toISOString(), autoSync: false } }));
    setDialogTarget(null);
    showToast(`Connected to ${INTEGRATIONS.find((i) => i.id === id)?.name}. (Simulated)`);
  }

  function handleDisconnect(id: IntegrationId) {
    onChange((prev) => ({ ...prev, [id]: { connectedAt: null, autoSync: false } }));
    showToast(`Disconnected from ${INTEGRATIONS.find((i) => i.id === id)?.name}.`);
  }

  function toggleAutoSync(id: IntegrationId) {
    onChange((prev) => ({ ...prev, [id]: { ...prev[id], autoSync: !prev[id].autoSync } }));
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((integration) => {
          const Icon = ICONS[integration.id];
          const state = integrations[integration.id];
          const connected = !!state?.connectedAt;
          return (
            <div key={integration.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{integration.name}</h3>
                    <p className="text-xs text-slate-500">{integration.description}</p>
                  </div>
                </div>
              </div>

              {connected ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Connected · synced {formatRelativeTime(state.connectedAt!)}
                  </div>
                  <label className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    Auto-sync new expenses
                    <button
                      role="switch"
                      aria-checked={state.autoSync}
                      onClick={() => toggleAutoSync(integration.id)}
                      className={`relative h-5 w-9 rounded-full transition ${
                        state.autoSync ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                          state.autoSync ? "left-4.5" : "left-0.5"
                        }`}
                        style={{ left: state.autoSync ? "1.125rem" : "0.125rem" }}
                      />
                    </button>
                  </label>
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <Unplug className="h-3.5 w-3.5" />
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDialogTarget(integration)}
                  className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      <ConnectIntegrationDialog
        integration={dialogTarget}
        onClose={() => setDialogTarget(null)}
        onConfirm={handleConnected}
      />
    </>
  );
}
