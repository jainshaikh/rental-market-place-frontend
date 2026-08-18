'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMyTrips, useCancelTrip } from '../../hooks/useTrips';
import { StatusBadge } from '../common/StatusBadge';

interface MyTripsListProps {
  basePath: string; // e.g. '/dashboard/trips'
  newHref: string; // e.g. '/dashboard/trips/new'
}

export function MyTripsList({ basePath, newHref }: MyTripsListProps) {
  const { data, isLoading } = useMyTrips({ limit: 50 });
  const cancelTrip = useCancelTrip();
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const trips = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
          <p className="mt-1 text-sm text-slate-500">
            Intercity trips you&apos;ve posted
            {meta && ` · ${meta.total} total`}
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
            Post a trip
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
              <div className="h-4 w-48 rounded bg-slate-100 mb-2" />
              <div className="h-3 w-64 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <svg className="mx-auto mb-3 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="font-medium text-slate-500">No trips posted yet</p>
          <Link href={newHref} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            Post your first trip →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => {
            const departed = new Date(trip.departureAt) < new Date();
            return (
              <div
                key={trip.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`${basePath}/${trip.id}`}
                      className="font-semibold text-slate-900 hover:text-primary hover:underline"
                    >
                      {trip.originCity.charAt(0).toUpperCase() + trip.originCity.slice(1)}
                      {' → '}
                      {trip.destinationCity.charAt(0).toUpperCase() + trip.destinationCity.slice(1)}
                    </Link>
                    <StatusBadge status={trip.status} size="sm" />
                    {departed && trip.status === 'ACTIVE' && (
                      <span className="text-xs text-slate-400">(departed)</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {trip.userVehicle.make} {trip.userVehicle.model} · {new Date(trip.departureAt).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="font-semibold text-slate-800">
                      PKR {Number(trip.pricePerSeat).toLocaleString()}
                      <span className="text-xs font-normal text-slate-400">/seat</span>
                    </span>
                    <span className="text-xs text-slate-400">{trip.availableSeats} seats</span>
                  </div>
                  {trip.status === 'REJECTED' && trip.rejectionReason && (
                    <p className="mt-1 text-xs text-red-500">Reason: {trip.rejectionReason}</p>
                  )}
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <Link href={`${basePath}/${trip.id}`} className="text-xs font-medium text-slate-500 hover:underline">
                    View
                  </Link>
                  {trip.status === 'ACTIVE' && (
                    <button
                      onClick={() => setConfirmCancelId(trip.id)}
                      className="text-xs text-slate-400 transition-colors hover:text-red-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmCancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Cancel this trip?</h3>
            <p className="mt-1 text-sm text-slate-500">
              Riders will no longer be able to find or contact you for this trip.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmCancelId(null)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Keep it
              </button>
              <button
                onClick={async () => {
                  await cancelTrip.mutateAsync({ id: confirmCancelId });
                  setConfirmCancelId(null);
                }}
                disabled={cancelTrip.isPending}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelTrip.isPending ? 'Cancelling…' : 'Cancel trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
