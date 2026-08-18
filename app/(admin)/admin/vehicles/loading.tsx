export default function AdminVehiclesLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-slate-200 rounded-lg w-44 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-52 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex gap-4">
              <div className="w-28 h-20 rounded-lg bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <div className="h-4 bg-slate-200 rounded w-48" />
                    <div className="h-3 bg-slate-100 rounded w-36" />
                    <div className="h-3 bg-slate-100 rounded w-56" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 bg-slate-200 rounded-lg w-20" />
                    <div className="h-9 bg-slate-100 rounded-lg w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
