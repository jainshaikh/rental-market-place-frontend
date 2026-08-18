'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useAdminUserDetail,
  useSuspendUser,
  useActivateUser,
} from '../../../../../hooks/useAdmin';
import { cn } from '../../../../../lib/utils/cn';

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

const PROVIDER_STATUS_CHIP: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-600',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-red-100 text-red-700',
};

const DOC_STATUS_CHIP: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

type ModalType = 'suspend' | 'activate' | null;

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading, isError } = useAdminUserDetail(id);
  const suspend = useSuspendUser();
  const activate = useActivateUser();

  const [modal, setModal] = useState<ModalType>(null);
  const [reasonInput, setReasonInput] = useState('');

  const isPending = suspend.isPending || activate.isPending;

  const openModal = (type: 'suspend' | 'activate') => {
    setReasonInput('');
    setModal(type);
  };

  const handleConfirm = async () => {
    if (!modal || !user) return;
    if (modal === 'suspend') {
      if (!reasonInput.trim()) return;
      await suspend.mutateAsync({ id: user.id, reason: reasonInput });
    } else {
      await activate.mutateAsync(user.id);
    }
    setModal(null);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-5">
        <div className="h-4 bg-slate-100 rounded w-24" />
        <div className="h-24 bg-white rounded-xl border border-slate-200" />
        <div className="h-40 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-medium">User not found</p>
        <Link href="/admin/users" className="text-sm text-primary hover:underline mt-2 inline-block">
          Back to users
        </Link>
      </div>
    );
  }

  const provider = user.providerProfile;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/users" className="hover:text-slate-600">Users</Link>
        <span>/</span>
        <span className="truncate text-slate-700">{user.name}</span>
      </nav>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', ROLE_CHIP[user.role] ?? 'bg-slate-100 text-slate-600')}>
                {user.role}
              </span>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_CHIP[user.status] ?? 'bg-slate-100 text-slate-600')}>
                {user.status.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>{user.email}</span>
              {user.phone && <span>{user.phone}</span>}
              <span>{user.emailVerified ? 'Email verified' : 'Email not verified'}</span>
              <span>Joined {new Date(user.createdAt).toLocaleDateString('en-AE', { dateStyle: 'medium' })}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {user.status === 'SUSPENDED' ? (
              <button
                onClick={() => openModal('activate')}
                className="text-sm font-semibold px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Activate user
              </button>
            ) : user.role === 'USER' || user.role === 'PROVIDER' ? (
              <button
                onClick={() => openModal('suspend')}
                className="text-sm font-semibold px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Suspend user
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {provider ? (
          <>
            <StatCard label="Vehicles" value={provider._count.vehicles} />
            <StatCard label="Booking requests" value={provider._count.bookingRequests} />
            <StatCard label="Showrooms" value={provider.showrooms.length} />
            <StatCard label="Documents" value={provider.documents.length} />
          </>
        ) : (
          <>
            <StatCard label="Booking requests" value={user._count.bookingRequests} />
            <StatCard label="Saved vehicles" value={user._count.savedVehicles} />
          </>
        )}
      </div>

      {/* Provider profile detail */}
      {provider && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{provider.businessName}</h2>
              {provider.businessDescription && (
                <p className="text-sm text-slate-500 mt-1">{provider.businessDescription}</p>
              )}
            </div>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', PROVIDER_STATUS_CHIP[provider.verificationStatus] ?? 'bg-slate-100 text-slate-600')}>
              {provider.verificationStatus.replace('_', ' ')}
            </span>
          </div>

          {provider.rejectionReason && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
              Rejection reason: {provider.rejectionReason}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Showrooms</h3>
              {provider.showrooms.length === 0 ? (
                <p className="text-sm text-slate-400">None added</p>
              ) : (
                <ul className="space-y-2">
                  {provider.showrooms.map((s) => (
                    <li key={s.id} className="text-sm text-slate-600">
                      <span className="font-medium text-slate-800">{s.name}</span> — {s.city}
                      {s.contactNumber && <span className="text-slate-400"> · {s.contactNumber}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Documents</h3>
              {provider.documents.length === 0 ? (
                <p className="text-sm text-slate-400">None uploaded</p>
              ) : (
                <ul className="space-y-2">
                  {provider.documents.map((d) => (
                    <li key={d.id} className="flex items-center justify-between text-sm">
                      <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-primary hover:underline">
                        {d.documentType.replace('_', ' ')}
                      </a>
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', DOC_STATUS_CHIP[d.status] ?? 'bg-slate-100 text-slate-600')}>
                        {d.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              {modal === 'suspend' ? 'Suspend user' : 'Activate user'}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              <strong>{user.name}</strong> ({user.email})
            </p>

            {modal === 'suspend' && (
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
                disabled={isPending || (modal === 'suspend' && !reasonInput.trim())}
                className={cn(
                  'px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60',
                  modal === 'suspend' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
                )}
              >
                {isPending ? 'Saving…' : modal === 'suspend' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
