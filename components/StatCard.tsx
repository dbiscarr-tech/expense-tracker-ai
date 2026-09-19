import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  accentColor?: string;
}

export function StatCard({ label, value, helper, icon: Icon, accentColor = "#2a78d6" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accentColor}1a`, color: accentColor }}
        >
          <Icon style={{ width: 18, height: 18 }} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}
