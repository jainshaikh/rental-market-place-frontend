export default function AdminProvidersLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-slate-200 rounded-lg w-48 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-56 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 rounded w-52" />
                <div className="h-4 bg-slate-100 rounded w-36" />
                <div className="h-3 bg-slate-100 rounded w-72" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 bg-slate-200 rounded-lg w-20" />
                <div className="h-9 bg-slate-100 rounded-lg w-16" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 flex gap-6">
              <div className="h-3 bg-slate-100 rounded w-32" />
              <div className="h-3 bg-slate-100 rounded w-28" />
              <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
