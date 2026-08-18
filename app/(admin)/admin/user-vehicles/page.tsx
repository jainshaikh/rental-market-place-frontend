'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useAdminUserVehicles,
  useApproveUserVehicle,
  useRejectUserVehicle,
  useSuspendUserVehicle,
  useReactivateUserVehicle,
} from '../../../../hooks/useAdmin';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { cn } from '../../../../lib/utils/cn';
import type { AdminUserVehicle } from '../../../../lib/api/admin.api';

const STATUS_TABS = [
  { label: 'Pending Review', value: 'PENDING_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'All', value: '' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

export default function AdminUserVehiclesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [rejectTarget, setRejectTarget] = useState<AdminUserVehicle | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  const { data, isFetching } = useAdminUserVehicles(page, statusFilter || undefined);
  const approve = useApproveUserVehicle();
  const reject = useRejectUserVehicle();
  const suspend = useSuspendUserVehicle();
  const reactivate = useReactivateUserVehicle();

  const vehicles = data?.data ?? [];
  const meta = data?.meta;

  const handleTabChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleReject = async () => {
    if (!rejectTarget || !reasonInput.trim()) return;
    await reject.mutateAsync({ id: rejectTarget.id, reason: reasonInput });
    setRejectTarget(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vehicle Verifications</h1>
        <p className="mt-1 text-sm text-slate-500">
          {meta ? `${meta.total.toLocaleString()} vehicle${meta.total !== 1 ? 's' : ''}` : "Review users' personal vehicles for trip posting"}
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
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Owner</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plate</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    onClick={() => router.push(`/admin/user-vehicles/${vehicle.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/user-vehicles/${vehicle.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-slate-800 hover:text-primary hover:underline"
                      >
                        {vehicle.make} {vehicle.model}{vehicle.year ? ` (${vehicle.year})` : ''}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{vehicle.owner.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{vehicle.plateNumber}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(vehicle.createdAt).toLocaleDateString('en-AE', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={vehicle.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {vehicle.status === 'PENDING_REVIEW' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => approve.mutate(vehicle.id)}
                            disabled={approve.isPending}
                            className="text-xs font-semibold text-green-600 hover:underline disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setRejectTarget(vehicle); setReasonInput(''); }}
                            className="text-xs font-semibold text-red-500 hover:underline"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {vehicle.status === 'APPROVED' && (
                        <button
                          onClick={() => suspend.mutate(vehicle.id)}
                          disabled={suspend.isPending}
                          className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      {vehicle.status === 'SUSPENDED' && (
                        <button
                          onClick={() => reactivate.mutate(vehicle.id)}
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

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Reject vehicle</h2>
            <p className="text-sm text-slate-500 mb-4">
              <strong>{rejectTarget.make} {rejectTarget.model}</strong> by {rejectTarget.owner.name}
            </p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g. CNIC photo is unreadable"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={reject.isPending || !reasonInput.trim()}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-500 hover:bg-red-600 disabled:opacity-60"
              >
                {reject.isPending ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
