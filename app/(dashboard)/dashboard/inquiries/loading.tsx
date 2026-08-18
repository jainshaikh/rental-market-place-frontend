export default function InquiriesLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-slate-200 rounded-lg w-40 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-56 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex gap-4">
              <div className="w-20 h-14 rounded-lg bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-48" />
                  <div className="h-6 bg-slate-100 rounded-full w-28" />
                </div>
                <div className="h-3 bg-slate-100 rounded w-36" />
                <div className="h-3 bg-slate-100 rounded w-64" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
