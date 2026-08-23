'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminUsers, useSuspendUser, useActivateUser } from '../../../../hooks/useAdmin';
import type { AdminUser } from '../../../../lib/api/admin.api';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import {
  AdminEmptyRow,
  AdminPageHeader,
  AdminRow,
  AdminSkeletonRows,
  AdminTable,
  AdminTableFooter,
  RoleBadge,
} from '../../../../components/admin';
import { Avatar, Button, ConfirmDialog, Select } from '../../../../components/ui';

const ROLE_OPTS = [
  { value: '', label: 'All roles' },
  { value: 'USER', label: 'User' },
  { value: 'PROVIDER', label: 'Provider' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUS_OPTS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING_VERIFICATION', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

type ModalState = { type: 'suspend' | 'activate'; user: AdminUser } | null;

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<ModalState>(null);

  const { data, isFetching } = useAdminUsers(
    page,
    roleFilter || undefined,
    statusFilter || undefined,
  );
  const suspend = useSuspendUser();
  const activate = useActivateUser();

  const users = data?.data ?? [];
  const meta = data?.meta;
  const isPending = suspend.isPending || activate.isPending;

  const handleFilterChange = (key: 'role' | 'status', value: string) => {
    if (key === 'role') setRoleFilter(value);
    else setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Users"
        subtitle={meta ? `${meta.total.toLocaleString()} total users` : 'Manage platform users'}
      />

      <div className="flex flex-wrap gap-3">
        <Select
          value={roleFilter}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          className="w-auto"
          aria-label="Filter by role"
        >
          {ROLE_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-auto"
          aria-label="Filter by status"
        >
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <AdminTable
        busy={isFetching}
        columns={['User', 'Role', 'Status', 'Joined', { label: 'Actions', align: 'right' }]}
      >
        {isFetching && users.length === 0 ? (
          <AdminSkeletonRows colSpan={5} />
        ) : users.length === 0 ? (
          <AdminEmptyRow colSpan={5}>No users found</AdminEmptyRow>
        ) : (
          users.map((u) => (
            <AdminRow key={u.id} onOpen={() => router.push(`/admin/users/${u.id}`)}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} size="sm" shape="square" tone="ink" />
                  <div className="min-w-0">
                    <Link
                      href={`/admin/users/${u.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block truncate font-medium text-ink transition-colors hover:text-brand-700"
                    >
                      {u.name}
                    </Link>
                    <p className="truncate text-xs text-text-faint">{u.email}</p>
                    {u.providerProfile && (
                      <p className="mt-0.5 truncate text-xs text-brand-700">
                        {u.providerProfile.businessName}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <RoleBadge role={u.role} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={u.status} size="sm" />
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-text-faint">
                {new Date(u.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
              </td>
              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                {u.status === 'SUSPENDED' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setModal({ type: 'activate', user: u })}
                  >
                    Activate
                  </Button>
                ) : u.role === 'USER' || u.role === 'PROVIDER' ? (
                  <Button
                    size="sm"
                    variant="danger-outline"
                    onClick={() => setModal({ type: 'suspend', user: u })}
                  >
                    Suspend
                  </Button>
                ) : (
                  <span className="text-xs text-text-faint">—</span>
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

      {/* One dialog for both actions. `requireReason` supplies the mandatory
          suspension reason the old hand-rolled modal validated by hand. */}
      <ConfirmDialog
        open={!!modal}
        onOpenChange={(open) => !open && setModal(null)}
        title={modal?.type === 'suspend' ? 'Suspend user?' : 'Activate user?'}
        description={modal ? `${modal.user.name} (${modal.user.email})` : undefined}
        requireReason={modal?.type === 'suspend'}
        reasonLabel="Reason for suspension"
        confirmLabel={modal?.type === 'suspend' ? 'Suspend user' : 'Activate user'}
        cancelLabel="Cancel"
        destructive={modal?.type === 'suspend'}
        loading={isPending}
        onConfirm={async (reason) => {
          if (!modal) return;
          if (modal.type === 'suspend') {
            if (!reason) return;
            await suspend.mutateAsync({ id: modal.user.id, reason });
          } else {
            await activate.mutateAsync(modal.user.id);
          }
          setModal(null);
        }}
      />
    </div>
  );
}
