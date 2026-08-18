export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-slate-200 rounded-lg w-56 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-40 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="h-4 bg-slate-100 rounded w-28 mb-2" />
            <div className="h-8 bg-slate-200 rounded-lg w-16" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-40" />
          <div className="h-4 bg-slate-100 rounded w-36" />
        </div>
      </div>
    </div>
  );
}
