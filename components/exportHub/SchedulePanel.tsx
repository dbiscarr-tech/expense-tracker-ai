"use client";

import { useState } from "react";
import { CalendarClock, PauseCircle, PlayCircle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import {
  INTEGRATIONS,
  TEMPLATES,
  computeNextRun,
  type Frequency,
  type IntegrationsMap,
  type ScheduleEntry,
  type TemplateId,
} from "@/lib/cloudExport";

interface SchedulePanelProps {
  schedules: ScheduleEntry[];
  onChange: (updater: ScheduleEntry[] | ((prev: ScheduleEntry[]) => ScheduleEntry[])) => void;
  integrations: IntegrationsMap;
}

const FREQUENCY_LABEL: Record<Frequency, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };

export function SchedulePanel({ schedules, onChange, integrations }: SchedulePanelProps) {
  const { showToast } = useToast();
  const connectedDestinations = INTEGRATIONS.filter((i) => integrations[i.id]?.connectedAt);
  const destinationOptions = ["Email", ...connectedDestinations.map((i) => i.name)];

  const [templateId, setTemplateId] = useState<TemplateId>(TEMPLATES[0].id);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [time, setTime] = useState("09:00");
  const [destination, setDestination] = useState(destinationOptions[0]);

  function handleCreate() {
    const nextRunAt = computeNextRun(frequency, time);
    onChange((prev) => [
      {
        id: crypto.randomUUID(),
        frequency,
        templateId,
        destination,
        time,
        createdAt: new Date().toISOString(),
        nextRunAt,
        active: true,
      },
      ...prev,
    ]);
    showToast("Backup schedule created.");
  }

  function toggleActive(id: string) {
    onChange((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  }

  function remove(id: string) {
    onChange((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Create a recurring backup</h2>
        <p className="mt-1 text-xs text-slate-500">
          Configure the export; this demo shows the next scheduled run but doesn&apos;t execute it in the
          background.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Template</label>
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
            <label className="mb-1 block text-xs font-medium text-slate-500">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Destination</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {destinationOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
        {connectedDestinations.length === 0 && (
          <p className="mt-2 text-xs text-slate-400">
            Tip: connect an integration on the Integrations tab to unlock more destinations.
          </p>
        )}
        <button
          onClick={handleCreate}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Create schedule
        </button>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Active schedules</h2>
        {schedules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center text-sm text-slate-400">
            No schedules configured yet.
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {FREQUENCY_LABEL[schedule.frequency]} · {TEMPLATES.find((t) => t.id === schedule.templateId)?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      To {schedule.destination} at {schedule.time} · Next run{" "}
                      {new Date(schedule.nextRunAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      schedule.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {schedule.active ? "Active" : "Paused"}
                  </span>
                  <button
                    onClick={() => toggleActive(schedule.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={schedule.active ? "Pause schedule" : "Resume schedule"}
                  >
                    {schedule.active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => remove(schedule.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete schedule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
