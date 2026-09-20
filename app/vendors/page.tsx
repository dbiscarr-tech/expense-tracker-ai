"use client";

import { useExpenses } from "@/context/ExpensesContext";
import { EmptyState } from "@/components/EmptyState";
import { VendorList } from "@/components/VendorList";
import { VendorsSkeleton } from "@/components/Skeletons";
import { getTopVendors } from "@/lib/stats";

export default function VendorsPage() {
  const { expenses, isLoaded } = useExpenses();

  if (!isLoaded) {
    return <VendorsSkeleton />;
  }

  const vendors = getTopVendors(expenses);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Top Vendors</h1>
        <p className="text-sm text-slate-500">
          See which vendors you spend the most with, ranked by total amount.
        </p>
      </div>

      {vendors.length === 0 ? <EmptyState context="vendors" /> : <VendorList vendors={vendors} />}
    </div>
  );
}
