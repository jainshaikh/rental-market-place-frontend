export default function VehicleDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-4 flex gap-2">
        <div className="h-4 w-16 rounded-control bg-border-subtle" />
        <div className="h-4 w-4 rounded-control bg-surface-hover" />
        <div className="h-4 w-40 rounded-control bg-border-subtle" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main image */}
          <div className="aspect-[16/10] rounded-card bg-border-subtle" />

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-media bg-surface-hover" />
            ))}
          </div>

          {/* Title + specs */}
          <div className="space-y-3">
            <div className="h-7 w-2/3 rounded-control bg-border-subtle" />
            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-control bg-surface-hover" />
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-control bg-border-subtle" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-7 w-24 rounded-chip bg-surface-hover" />
              ))}
            </div>
          </div>
        </div>

        {/* Right column — inquiry card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-3.5">
            <div className="space-y-4 rounded-card border border-border-subtle bg-surface p-7">
              <div className="h-9 w-36 rounded-control bg-border-subtle" />
              <div className="h-4 w-24 rounded-control bg-surface-hover" />
              <div className="h-4 w-48 rounded-control bg-surface-hover" />
              <div className="mt-4 h-12 rounded-control bg-border-subtle" />
            </div>
            <div className="flex gap-3.5">
              <div className="flex-1 rounded-card border border-border-subtle bg-surface py-6" />
              <div className="flex-1 rounded-card border border-border-subtle bg-surface py-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
