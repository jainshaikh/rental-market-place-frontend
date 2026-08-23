'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Search, X } from 'lucide-react';
import {
  useAdminAllVehicles,
  useApproveVehicle,
  useRejectVehicle,
} from '../../../../hooks/useAdmin';
import type { AdminVehicleSummary } from '../../../../lib/api/admin.api';
import { getCurrencyCode } from '../../../../lib/utils/currency';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import {
  AdminEmptyRow,
  AdminPageHeader,
  AdminRow,
  AdminSkeletonRows,
  AdminTable,
  AdminTableFooter,
  ApproveDialog,
  StatusTabs,
} from '../../../../components/admin';
import { Button, ConfirmDialog, Input } from '../../../../components/ui';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending Review', value: 'PENDING_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Archived', value: 'ARCHIVED' },
];

type ModalState = { type: 'approve' | 'reject'; vehicle: AdminVehicleSummary } | null;

export default function AdminVehiclesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modal, setModal] = useState<ModalState>(null);

  const { data, isFetching } = useAdminAllVehicles(
    page,
    statusFilter || undefined,
    search || undefined,
  );
  const approve = useApproveVehicle();
  const reject = useRejectVehicle();

  const vehicles = data?.data ?? [];
  const meta = data?.meta;
  const isPending = approve.isPending || reject.isPending;

  const clearSearch = () => {
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Vehicles"
        subtitle={
          meta
            ? `${meta.total.toLocaleString()} total listing${meta.total !== 1 ? 's' : ''}`
            : 'All vehicle listings'
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusTabs
          tabs={STATUS_TABS}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
          className="flex gap-2"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
            <Input
              type="text"
              placeholder="Search title, make, model…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-56 pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>

      <AdminTable
        busy={isFetching}
        columns={[
          'Vehicle',
          'Provider',
          'City',
          'Price/day',
          'Status',
          'Added',
          { label: 'Actions', align: 'right' },
        ]}
      >
        {isFetching && vehicles.length === 0 ? (
          <AdminSkeletonRows colSpan={7} />
        ) : vehicles.length === 0 ? (
          <AdminEmptyRow colSpan={7}>No vehicles found</AdminEmptyRow>
        ) : (
          vehicles.map((v) => (
            <AdminRow key={v.id} onOpen={() => router.push(`/admin/vehicles/${v.id}`)}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-media border border-border-subtle bg-surface-hover">
                    {v.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.images[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-text-faint">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/vehicles/${v.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block max-w-[190px] truncate font-medium leading-snug text-ink transition-colors hover:text-brand-700"
                    >
                      {v.title}
                    </Link>
                    <p className="font-mono text-xs text-text-faint">{v.year}</p>
                    {v.rejectionReason && (
                      <p
                        className="max-w-[190px] truncate text-xs text-status-red-fg"
                        title={v.rejectionReason}
                      >
                        {v.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="text-ink-soft px-4 py-3">{v.providerProfile.businessName}</td>
              <td className="px-4 py-3 text-text-muted">
                {v.showroom?.city
                  ? v.showroom.city.charAt(0).toUpperCase() + v.showroom.city.slice(1)
                  : '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-ink">
                {getCurrencyCode(v.showroom?.country)} {Number(v.pricePerDay).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={v.status} size="sm" />
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-text-faint">
                {new Date(v.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                {v.status === 'PENDING_REVIEW' ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => setModal({ type: 'approve', vehicle: v })}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger-outline"
                      onClick={() => setModal({ type: 'reject', vehicle: v })}
                    >
                      Reject
                    </Button>
                  </div>
                ) : v.status === 'DRAFT' || v.status === 'REJECTED' ? (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setModal({ type: 'approve', vehicle: v })}
                    >
                      Approve
                    </Button>
                  </div>
                ) : (
                  <p className="text-right text-xs text-text-faint">—</p>
                )}
              </td>
            </AdminRow>
          ))
        )}
      </AdminTable>

      {meta && (
        <AdminTableFooter
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      <ApproveDialog
        open={modal?.type === 'approve'}
        onOpenChange={(open) => !open && setModal(null)}
        title="Approve listing?"
        subject={
          modal?.type === 'approve'
            ? `${modal.vehicle.title} by ${modal.vehicle.providerProfile.businessName}`
            : undefined
        }
        confirmLabel="Approve listing"
        placeholder="Any notes for the provider…"
        loading={isPending}
        onConfirm={async (note) => {
          if (modal?.type !== 'approve') return;
          await approve.mutateAsync({ id: modal.vehicle.id, note });
          setModal(null);
        }}
      />

      <ConfirmDialog
        open={modal?.type === 'reject'}
        onOpenChange={(open) => !open && setModal(null)}
        title="Reject listing?"
        description={
          modal?.type === 'reject'
            ? `${modal.vehicle.title} by ${modal.vehicle.providerProfile.businessName}`
            : undefined
        }
        requireReason
        reasonLabel="What needs to be fixed?"
        confirmLabel="Reject listing"
        cancelLabel="Cancel"
        loading={isPending}
        onConfirm={async (reason) => {
          if (modal?.type !== 'reject' || !reason) return;
          await reject.mutateAsync({ id: modal.vehicle.id, reason });
          setModal(null);
        }}
      />
    </div>
  );
}
