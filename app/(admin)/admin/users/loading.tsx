export default function AdminUsersLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-slate-200 rounded-lg w-24 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-40 mb-5" />
      <div className="flex gap-3 mb-5">
        <div className="h-9 bg-slate-100 rounded-lg w-32" />
        <div className="h-9 bg-slate-100 rounded-lg w-36" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="h-10 bg-slate-50 border-b border-slate-100" />
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-4 items-center">
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-slate-200 rounded w-36" />
                <div className="h-3 bg-slate-100 rounded w-48" />
              </div>
              <div className="h-5 bg-slate-100 rounded-full w-16" />
              <div className="h-5 bg-slate-100 rounded-full w-20" />
              <div className="h-3 bg-slate-100 rounded w-24" />
              <div className="h-3 bg-slate-100 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
