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
import type { AdminUserVehicle } from '../../../../lib/api/admin.api';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import {
  AdminEmptyRow,
  AdminPageHeader,
  AdminRow,
  AdminSkeletonRows,
  AdminTable,
  AdminTableFooter,
  StatusTabs,
} from '../../../../components/admin';
import { Avatar, Button, ConfirmDialog } from '../../../../components/ui';

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

  const { data, isFetching } = useAdminUserVehicles(page, statusFilter || undefined);
  const approve = useApproveUserVehicle();
  const reject = useRejectUserVehicle();
  const suspend = useSuspendUserVehicle();
  const reactivate = useReactivateUserVehicle();

  const vehicles = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Moderation"
        title="Vehicle Verifications"
        subtitle={
          meta
            ? `${meta.total.toLocaleString()} vehicle${meta.total !== 1 ? 's' : ''}`
            : "Review users' personal vehicles for trip posting"
        }
      />

      <StatusTabs
        tabs={STATUS_TABS}
        value={statusFilter}
        onChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
      />

      <AdminTable
        busy={isFetching}
        columns={[
          'Vehicle',
          'Owner',
          'Plate',
          'Submitted',
          'Status',
          { label: 'Actions', align: 'right' },
        ]}
      >
        {isFetching && vehicles.length === 0 ? (
          <AdminSkeletonRows colSpan={6} />
        ) : vehicles.length === 0 ? (
          <AdminEmptyRow colSpan={6}>No vehicles found</AdminEmptyRow>
        ) : (
          vehicles.map((vehicle) => (
            <AdminRow
              key={vehicle.id}
              onOpen={() => router.push(`/admin/user-vehicles/${vehicle.id}`)}
            >
              <td className="px-4 py-3">
                <Link
                  href={`/admin/user-vehicles/${vehicle.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-ink transition-colors hover:text-brand-700"
                >
                  {vehicle.make} {vehicle.model}
                  {vehicle.year ? ` (${vehicle.year})` : ''}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className="text-ink-soft flex items-center gap-2.5">
                  <Avatar name={vehicle.owner.name} size="sm" />
                  {vehicle.owner.name}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs uppercase text-text-muted">
                {vehicle.plateNumber}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-text-faint">
                {new Date(vehicle.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={vehicle.status} size="sm" />
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-2">
                  {vehicle.status === 'PENDING_REVIEW' && (
                    <>
                      <Button
                        size="sm"
                        loading={approve.isPending}
                        onClick={() => approve.mutate(vehicle.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger-outline"
                        onClick={() => setRejectTarget(vehicle)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {vehicle.status === 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="danger-outline"
                      loading={suspend.isPending}
                      onClick={() => suspend.mutate(vehicle.id)}
                    >
                      Suspend
                    </Button>
                  )}
                  {vehicle.status === 'SUSPENDED' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={reactivate.isPending}
                      onClick={() => reactivate.mutate(vehicle.id)}
                    >
                      Reactivate
                    </Button>
                  )}
                  {(vehicle.status === 'REJECTED' || vehicle.status === 'DRAFT') && (
                    <span className="text-xs text-text-faint">—</span>
                  )}
                </div>
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

      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject vehicle?"
        description={
          rejectTarget
            ? `${rejectTarget.make} ${rejectTarget.model} — ${rejectTarget.owner.name}`
            : undefined
        }
        requireReason
        reasonLabel="Reason for rejection"
        confirmLabel="Reject vehicle"
        cancelLabel="Cancel"
        loading={reject.isPending}
        onConfirm={async (reason) => {
          if (!rejectTarget || !reason) return;
          await reject.mutateAsync({ id: rejectTarget.id, reason });
          setRejectTarget(null);
        }}
      />
    </div>
  );
}
