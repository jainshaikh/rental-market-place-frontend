import { TripCardSkeleton } from '../../../components/trips/TripCard';

export default function CarpoolLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-7 space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-control bg-border-subtle" />
        <div className="h-4 w-72 animate-pulse rounded-control bg-surface-hover" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
        {/* Filter sidebar skeleton */}
        <aside className="hidden w-[236px] flex-shrink-0 lg:block">
          <div className="space-y-5 rounded-card border border-border-subtle bg-surface p-[18px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded-control bg-border-subtle" />
                <div className="h-9 animate-pulse rounded-control bg-surface-hover" />
              </div>
            ))}
          </div>
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded-control bg-surface-hover" />
            <div className="h-8 w-36 animate-pulse rounded-control bg-surface-hover" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
