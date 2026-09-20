function Pulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Pulse className="h-7 w-40" />
        <Pulse className="mt-2 h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Pulse className="h-72" />
        <Pulse className="h-72" />
      </div>
      <Pulse className="h-64" />
    </div>
  );
}

export function ExpensesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Pulse className="h-7 w-32" />
        <Pulse className="mt-2 h-4 w-64" />
      </div>
      <Pulse className="h-24" />
      <Pulse className="h-96" />
    </div>
  );
}

export function VendorsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Pulse className="h-7 w-40" />
        <Pulse className="mt-2 h-4 w-64" />
      </div>
      <Pulse className="h-96" />
    </div>
  );
}
