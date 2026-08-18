'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMyUserVehicles } from '../../hooks/useUserVehicles';
import { StatusBadge } from '../common/StatusBadge';

interface MyVehiclesListProps {
  basePath: string; // e.g. '/dashboard/my-vehicles'
  newHref: string; // e.g. '/dashboard/my-vehicles/new'
}

export function MyVehiclesList({ basePath, newHref }: MyVehiclesListProps) {
  const { data: vehicles, isLoading } = useMyUserVehicles();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Vehicles</h1>
          <p className="mt-1 text-sm text-slate-500">
            Register a vehicle once, reuse it for any number of trips
          </p>
        </div>
        {!isLoading && (
          <Link
            href={newHref}
            className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add vehicle
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
              <div className="h-4 w-48 rounded bg-slate-100 mb-2" />
              <div className="h-3 w-32 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : !vehicles || vehicles.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <svg className="mx-auto mb-3 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z" />
          </svg>
          <p className="font-medium text-slate-500">No vehicles registered yet</p>
          <Link href={newHref} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            Add your first vehicle →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
            >
              {vehicle.images[0] && (
                <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200">
                  <Image src={vehicle.images[0].url} alt="" fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`${basePath}/${vehicle.id}`}
                    className="font-semibold text-slate-900 hover:text-primary hover:underline"
                  >
                    {vehicle.make} {vehicle.model}{vehicle.year ? ` (${vehicle.year})` : ''}
                  </Link>
                  <StatusBadge status={vehicle.status} size="sm" />
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Plate {vehicle.plateNumber}{vehicle.color ? ` · ${vehicle.color}` : ''}
                </p>
                {vehicle.status === 'REJECTED' && vehicle.rejectionReason && (
                  <p className="mt-1 text-xs text-red-500">Reason: {vehicle.rejectionReason}</p>
                )}
              </div>

              <Link href={`${basePath}/${vehicle.id}`} className="text-xs font-medium text-slate-500 hover:underline flex-shrink-0">
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
