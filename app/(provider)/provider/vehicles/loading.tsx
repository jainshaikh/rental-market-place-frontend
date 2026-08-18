export default function ProviderVehiclesLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-7 bg-slate-200 rounded-lg w-36" />
          <div className="h-4 bg-slate-100 rounded w-52" />
        </div>
        <div className="h-9 bg-slate-200 rounded-lg w-32" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-slate-200 rounded-lg w-16" />
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4">
            <div className="w-24 h-16 rounded-lg bg-slate-100 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-48" />
              <div className="h-3 bg-slate-100 rounded w-64" />
              <div className="h-6 bg-slate-100 rounded-full w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
