'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminTrips, useSuspendTrip, useReactivateTrip } from '../../../../hooks/useAdmin';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { cn } from '../../../../lib/utils/cn';

const STATUS_TABS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'All', value: '' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

export default function AdminTripsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const { data, isFetching } = useAdminTrips(page, statusFilter || undefined);
  const suspend = useSuspendTrip();
  const reactivate = useReactivateTrip();

  const trips = data?.data ?? [];
  const meta = data?.meta;

  const handleTabChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Intercity Trips</h1>
        <p className="mt-1 text-sm text-slate-500">
          {meta ? `${meta.total.toLocaleString()} trip${meta.total !== 1 ? 's' : ''}` : 'Trips go live automatically once posted with an approved vehicle'}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              'whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className={cn('overflow-x-auto', isFetching && 'opacity-70 transition-opacity')}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Route</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Posted by</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Departure</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price/seat</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No trips found
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr
                    key={trip.id}
                    onClick={() => router.push(`/admin/trips/${trip.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/trips/${trip.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-slate-800 hover:text-primary hover:underline"
                      >
                        {trip.originCity} → {trip.destinationCity}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{trip.postedBy.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {trip.userVehicle.make} {trip.userVehicle.model} · {trip.userVehicle.plateNumber}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(trip.departureAt).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      PKR {Number(trip.pricePerSeat).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={trip.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {trip.status === 'ACTIVE' && (
                        <button
                          onClick={() => suspend.mutate(trip.id)}
                          disabled={suspend.isPending}
                          className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      {trip.status === 'SUSPENDED' && (
                        <button
                          onClick={() => reactivate.mutate(trip.id)}
                          disabled={reactivate.isPending}
                          className="text-xs font-semibold text-green-600 hover:underline disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, meta.total)} of {meta.total.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((n) => n - 1)} disabled={page <= 1}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Previous
              </button>
              <button onClick={() => setPage((n) => n + 1)} disabled={page >= meta.totalPages}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
