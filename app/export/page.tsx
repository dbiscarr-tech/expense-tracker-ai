"use client";

import { useState } from "react";
import { Cloud, History, Mail, Share2, Sparkles, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useExpenses } from "@/context/ExpensesContext";
import { DashboardSkeleton } from "@/components/Skeletons";
import { QuickExportPanel } from "@/components/exportHub/QuickExportPanel";
import { EmailExportPanel } from "@/components/exportHub/EmailExportPanel";
import { IntegrationsPanel } from "@/components/exportHub/IntegrationsPanel";
import { SchedulePanel } from "@/components/exportHub/SchedulePanel";
import { SharingPanel } from "@/components/exportHub/SharingPanel";
import { HistoryPanel } from "@/components/exportHub/HistoryPanel";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import {
  DEFAULT_INTEGRATIONS,
  seedHistory,
  type HistoryEntry,
  type IntegrationsMap,
  type ScheduleEntry,
  type ShareLinkEntry,
} from "@/lib/cloudExport";

type TabId = "quick" | "email" | "integrations" | "schedule" | "sharing" | "history";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "quick", label: "Quick Export", icon: Sparkles },
  { id: "email", label: "Email", icon: Mail },
  { id: "integrations", label: "Integrations", icon: Cloud },
  { id: "schedule", label: "Schedule", icon: Timer },
  { id: "sharing", label: "Sharing", icon: Share2 },
  { id: "history", label: "History", icon: History },
];

export default function ExportHubPage() {
  const { expenses, isLoaded } = useExpenses();
  const [activeTab, setActiveTab] = useState<TabId>("quick");

  const [integrations, setIntegrations] = useLocalStorageState<IntegrationsMap>(
    "expense-tracker:export-integrations:v1",
    DEFAULT_INTEGRATIONS
  );
  const [schedules, setSchedules] = useLocalStorageState<ScheduleEntry[]>(
    "expense-tracker:export-schedules:v1",
    []
  );
  const [history, setHistory] = useLocalStorageState<HistoryEntry[]>(
    "expense-tracker:export-history:v1",
    seedHistory()
  );
  const [shareLinks, setShareLinks] = useLocalStorageState<ShareLinkEntry[]>(
    "expense-tracker:export-shares:v1",
    []
  );

  function addHistoryEntry(entry: HistoryEntry) {
    setHistory((prev) => [entry, ...prev]);
  }

  if (!isLoaded) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Export Hub</h1>
        <p className="text-sm text-slate-500">
          Templates, integrations, sharing, and scheduled backups — all in one place.
        </p>
      </div>

      <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "quick" && <QuickExportPanel expenses={expenses} onExported={addHistoryEntry} />}
      {activeTab === "email" && <EmailExportPanel expenses={expenses} onExported={addHistoryEntry} />}
      {activeTab === "integrations" && (
        <IntegrationsPanel integrations={integrations} onChange={setIntegrations} />
      )}
      {activeTab === "schedule" && (
        <SchedulePanel
          schedules={schedules}
          onChange={setSchedules}
          integrations={integrations}
        />
      )}
      {activeTab === "sharing" && (
        <SharingPanel expenses={expenses} shareLinks={shareLinks} onChange={setShareLinks} />
      )}
      {activeTab === "history" && (
        <HistoryPanel history={history} expenses={expenses} onExported={addHistoryEntry} />
      )}
    </div>
  );
}
