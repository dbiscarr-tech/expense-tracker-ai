import type { VendorTotal } from "@/lib/stats";
import { formatCurrency } from "@/lib/format";

export function VendorList({ vendors }: { vendors: VendorTotal[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <th className="px-5 py-3 font-medium">Rank</th>
            <th className="px-5 py-3 font-medium">Vendor</th>
            <th className="px-5 py-3 font-medium">Transactions</th>
            <th className="px-5 py-3 text-right font-medium">% of spend</th>
            <th className="px-5 py-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {vendors.map((vendor, index) => (
            <tr key={vendor.vendor}>
              <td className="px-5 py-3 text-slate-400 tabular-nums">{index + 1}</td>
              <td className="px-5 py-3 font-medium text-slate-900">{vendor.vendor}</td>
              <td className="px-5 py-3 text-slate-500 tabular-nums">{vendor.count}</td>
              <td className="px-5 py-3 text-right text-slate-500 tabular-nums">
                {vendor.percent.toFixed(1)}%
              </td>
              <td className="px-5 py-3 text-right font-semibold tabular-nums text-slate-900">
                {formatCurrency(vendor.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
