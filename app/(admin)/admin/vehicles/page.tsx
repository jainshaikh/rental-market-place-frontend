'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useAdminAllVehicles,
  useApproveVehicle,
  useRejectVehicle,
} from '../../../../hooks/useAdmin';
import type { AdminVehicleSummary } from '../../../../lib/api/admin.api';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { cn } from '../../../../lib/utils/cn';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending Review', value: 'PENDING_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Archived', value: 'ARCHIVED' },
];

type ModalState =
  | { type: 'approve'; vehicle: AdminVehicleSummary }
  | { type: 'reject'; vehicle: AdminVehicleSummary }
  | null;

export default function AdminVehiclesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [noteInput, setNoteInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');

  const { data, isFetching } = useAdminAllVehicles(
    page,
    statusFilter || undefined,
    search || undefined,
  );
  const approve = useApproveVehicle();
  const reject = useRejectVehicle();

  const vehicles = data?.data ?? [];
  const meta = data?.meta;

  const handleTabChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const openModal = (type: 'approve' | 'reject', vehicle: AdminVehicleSummary) => {
    setNoteInput('');
    setReasonInput('');
    setModal({ type, vehicle });
  };

  const handleConfirm = async () => {
    if (!modal) return;
    if (modal.type === 'approve') {
      await approve.mutateAsync({ id: modal.vehicle.id, note: noteInput || undefined });
    } else {
      if (!reasonInput.trim()) return;
      await reject.mutateAsync({ id: modal.vehicle.id, reason: reasonInput });
    }
    setModal(null);
  };

  const isPending = approve.isPending || reject.isPending;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicles</h1>
          <p className="mt-1 text-sm text-slate-500">
            {meta ? `${meta.total.toLocaleString()} total listing${meta.total !== 1 ? 's' : ''}` : 'All vehicle listings'}
          </p>
        </div>
      </div>

      {/* Status tabs + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === tab.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search title, make, model…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-56 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">City</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Price/day</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Added</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className={cn('divide-y divide-slate-100', isFetching && 'opacity-60 transition-opacity')}>
              {isFetching && vehicles.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3" colSpan={7}>
                      <div className="h-10 animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-400">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <VehicleRow
                    key={v.id}
                    vehicle={v}
                    onOpen={() => router.push(`/admin/vehicles/${v.id}`)}
                    onApprove={() => openModal('approve', v)}
                    onReject={() => openModal('reject', v)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Page {page} of {meta.totalPages} &middot; {meta.total} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((n) => n - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((n) => n + 1)}
              disabled={page >= meta.totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Approve / Reject modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-semibold text-slate-900">
              {modal.type === 'approve' ? 'Approve listing' : 'Reject listing'}
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              <strong>{modal.vehicle.title}</strong> by {modal.vehicle.providerProfile.businessName}
            </p>

            {modal.type === 'approve' ? (
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Note <span className="font-normal normal-case text-slate-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Any notes for the provider…"
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Describe what needs to be fixed…"
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {!reasonInput.trim() && (
                  <p className="mt-1 text-xs text-red-500">A reason is required</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending || (modal.type === 'reject' && !reasonInput.trim())}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60',
                  modal.type === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
                )}
              >
                {isPending ? 'Saving…' : modal.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleRow({
  vehicle,
  onOpen,
  onApprove,
  onReject,
}: {
  vehicle: AdminVehicleSummary;
  onOpen: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const thumb = vehicle.images?.[0]?.url;
  const city = vehicle.showroom?.city;

  return (
    <tr onClick={onOpen} className="cursor-pointer hover:bg-slate-50">
      {/* Vehicle */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt={vehicle.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/vehicles/${vehicle.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-slate-900 leading-snug truncate max-w-[180px] block hover:text-primary hover:underline"
            >
              {vehicle.title}
            </Link>
            <p className="text-xs text-slate-400">{vehicle.year}</p>
            {vehicle.rejectionReason && (
              <p className="text-xs text-red-400 truncate max-w-[180px]" title={vehicle.rejectionReason}>
                {vehicle.rejectionReason}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Provider */}
      <td className="px-4 py-3">
        <p className="text-slate-700">{vehicle.providerProfile.businessName}</p>
      </td>

      {/* City */}
      <td className="px-4 py-3 text-slate-500">
        {city ? city.charAt(0).toUpperCase() + city.slice(1) : '—'}
      </td>

      {/* Price */}
      <td className="px-4 py-3 font-medium text-slate-800">
        PKR {Number(vehicle.pricePerDay).toLocaleString()}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={vehicle.status} size="sm" />
      </td>

      {/* Added */}
      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
        {new Date(vehicle.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        {vehicle.status === 'PENDING_REVIEW' ? (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Reject
            </button>
          </div>
        ) : vehicle.status === 'DRAFT' || vehicle.status === 'REJECTED' ? (
          <button
            onClick={onApprove}
            className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
          >
            Approve
          </button>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </td>
    </tr>
  );
}
