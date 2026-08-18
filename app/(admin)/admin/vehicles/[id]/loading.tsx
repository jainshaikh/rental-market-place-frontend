export default function AdminVehicleDetailLoading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-4 bg-slate-100 rounded w-24" />
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="h-6 bg-slate-200 rounded w-64 mb-3" />
        <div className="h-4 bg-slate-100 rounded w-48" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="h-6 bg-slate-200 rounded w-16 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-20" />
          </div>
        ))}
      </div>
      <div className="h-64 bg-white rounded-xl border border-slate-200" />
      <div className="h-40 bg-white rounded-xl border border-slate-200" />
    </div>
  );
}
