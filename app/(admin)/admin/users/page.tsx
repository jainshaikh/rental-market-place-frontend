'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminUsers, useSuspendUser, useActivateUser } from '../../../../hooks/useAdmin';
import type { AdminUser } from '../../../../lib/api/admin.api';
import { cn } from '../../../../lib/utils/cn';

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

const STATUS_CHIP: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-700',
  SUSPENDED: 'bg-red-100 text-red-700',
};

const ROLE_CHIP: Record<string, string> = {
  USER: 'bg-slate-100 text-slate-600',
  PROVIDER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPER_ADMIN: 'bg-purple-200 text-purple-900',
};

type ModalState =
  | { type: 'suspend'; user: AdminUser }
  | { type: 'activate'; user: AdminUser }
  | null;

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [reasonInput, setReasonInput] = useState('');

  const { data, isFetching } = useAdminUsers(page, roleFilter || undefined, statusFilter || undefined);
  const suspend = useSuspendUser();
  const activate = useActivateUser();

  const users = data?.data ?? [];
  const meta = data?.meta;

  const handleFilterChange = (key: 'role' | 'status', value: string) => {
    if (key === 'role') setRoleFilter(value);
    else setStatusFilter(value);
    setPage(1);
  };

  const openModal = (type: 'suspend' | 'activate', user: AdminUser) => {
    setReasonInput('');
    setModal({ type, user });
  };

  const handleConfirm = async () => {
    if (!modal) return;
    if (modal.type === 'suspend') {
      if (!reasonInput.trim()) return;
      await suspend.mutateAsync({ id: modal.user.id, reason: reasonInput });
    } else {
      await activate.mutateAsync(modal.user.id);
    }
    setModal(null);
  };

  const isPending = suspend.isPending || activate.isPending;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 text-sm mt-1">
          {meta ? `${meta.total.toLocaleString()} total users` : 'Manage platform users'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={roleFilter}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {ROLE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className={cn('overflow-x-auto', isFetching && 'opacity-70 transition-opacity')}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="font-medium text-slate-800 hover:text-primary hover:underline">
                        {u.name}
                      </Link>
                      <p className="text-xs text-slate-400">{u.email}</p>
                      {u.providerProfile && (
                        <p className="text-xs text-blue-600 mt-0.5">{u.providerProfile.businessName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', ROLE_CHIP[u.role] ?? 'bg-slate-100 text-slate-600')}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_CHIP[u.status] ?? 'bg-slate-100 text-slate-600')}>
                        {u.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('en-AE', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {u.status === 'SUSPENDED' ? (
                        <button
                          onClick={() => openModal('activate', u)}
                          className="text-xs font-semibold text-green-600 hover:underline"
                        >
                          Activate
                        </button>
                      ) : u.role === 'USER' || u.role === 'PROVIDER' ? (
                        <button
                          onClick={() => openModal('suspend', u)}
                          className="text-xs font-semibold text-red-500 hover:underline"
                        >
                          Suspend
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              {modal.type === 'suspend' ? 'Suspend user' : 'Activate user'}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              <strong>{modal.user.name}</strong> ({modal.user.email})
            </p>

            {modal.type === 'suspend' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Reason for suspension…"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending || (modal.type === 'suspend' && !reasonInput.trim())}
                className={cn(
                  'px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60',
                  modal.type === 'suspend' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
                )}
              >
                {isPending ? 'Saving…' : modal.type === 'suspend' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
