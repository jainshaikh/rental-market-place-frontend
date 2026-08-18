'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Car, Plus, Search } from 'lucide-react';
import { useMyVehicles, useArchiveVehicle } from '../../../../hooks/useVehicles';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { Button, Card, ConfirmDialog, EmptyState, SegmentedTabs } from '../../../../components/ui';
import type { VehicleStatus } from '../../../../types/enums';

const STATUS_FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Under Review', value: 'PENDING_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export default function ProviderVehiclesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  const { data, isLoading } = useMyVehicles({
    status: (statusFilter || undefined) as VehicleStatus | undefined,
    search: search || undefined,
  });

  const archive = useArchiveVehicle();

  const vehicles = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">My Vehicles</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage your vehicle listings
            {meta && ` · ${meta.total} total`}
          </p>
        </div>
        {!isLoading && (
          <Link href="/provider/vehicles/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add vehicle
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
          <input
            type="text"
            placeholder="Search by title, make, or model…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-control border border-border-strong bg-surface py-2.5 pl-9 pr-4 text-sm text-ink outline-none focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/18"
          />
        </div>
        <SegmentedTabs
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Vehicle list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-card border border-border-subtle bg-surface p-4">
              <div className="flex gap-4">
                <div className="h-20 w-28 flex-shrink-0 rounded-media bg-surface-hover" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded-control bg-surface-hover" />
                  <div className="h-3 w-24 rounded-control bg-surface-hover" />
                  <div className="h-3 w-32 rounded-control bg-surface-hover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title={statusFilter || search ? 'No vehicles match your filters' : 'No vehicles yet'}
          description={!statusFilter && !search ? 'Add your first vehicle to start receiving inquiries from customers.' : undefined}
          action={
            !statusFilter && !search
              ? { label: 'Add vehicle', onClick: () => router.push('/provider/vehicles/new'), variant: 'primary' }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => {
            const cover = vehicle.images?.[0];
            return (
              <Card key={vehicle.id} hover className="flex items-start gap-4">
                {/* Cover image */}
                <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-media bg-surface-hover">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.url} alt={vehicle.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-text-faint">
                      <Car className="h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{vehicle.title}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {vehicle.transmission} · {vehicle.fuelType} · {vehicle.seatingCapacity} seats
                      </p>
                    </div>
                    <StatusBadge status={vehicle.status} size="sm" />
                  </div>

                  <div className="mt-2 flex items-center gap-4">
                    <p className="font-mono text-sm font-semibold text-ink">
                      PKR {Number(vehicle.pricePerDay).toLocaleString()}
                      <span className="font-sans text-xs font-normal text-text-faint">/day</span>
                    </p>
                    {vehicle.images.length > 0 && (
                      <p className="text-xs text-text-faint">
                        {vehicle.images.length} photo{vehicle.images.length !== 1 ? 's' : ''}
                      </p>
                    )}
                    {vehicle.rejectionReason && (
                      <p className="max-w-xs truncate text-xs text-red-600" title={vehicle.rejectionReason}>
                        Reason: {vehicle.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-3">
                  {(vehicle.status === 'DRAFT' || vehicle.status === 'REJECTED') && (
                    <Link href={`/provider/vehicles/${vehicle.id}/edit`} className="text-xs font-semibold text-brand-600 hover:underline">
                      Edit
                    </Link>
                  )}
                  {vehicle.status === 'APPROVED' && (
                    <Link href={`/provider/vehicles/${vehicle.id}/edit`} className="text-xs font-medium text-text-muted hover:underline">
                      View
                    </Link>
                  )}
                  {vehicle.status !== 'ARCHIVED' && (
                    <button onClick={() => setConfirmArchiveId(vehicle.id)} className="text-xs text-text-faint transition-colors hover:text-red-600">
                      Archive
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Archive confirmation */}
      <ConfirmDialog
        open={!!confirmArchiveId}
        onOpenChange={(open) => !open && setConfirmArchiveId(null)}
        title="Archive vehicle?"
        description="This will hide the listing from your fleet. You can't undo this easily."
        confirmLabel="Archive"
        cancelLabel="Cancel"
        loading={archive.isPending}
        onConfirm={async () => {
          if (!confirmArchiveId) return;
          await archive.mutateAsync(confirmArchiveId);
          setConfirmArchiveId(null);
        }}
      />
    </div>
  );
}
