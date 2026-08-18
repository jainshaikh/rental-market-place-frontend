'use client';

import { useState } from 'react';
import {
  usePendingProviders,
  useApproveProvider,
  useRejectProvider,
} from '../../../../hooks/useAdmin';
import type { AdminProviderSummary } from '../../../../lib/api/admin.api';
import { cn } from '../../../../lib/utils/cn';

type ModalState =
  | { type: 'approve'; provider: AdminProviderSummary }
  | { type: 'reject'; provider: AdminProviderSummary }
  | null;

export default function AdminProvidersPage() {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [noteInput, setNoteInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');

  const { data, isFetching } = usePendingProviders(page);
  const approve = useApproveProvider();
  const reject = useRejectProvider();

  const providers = data?.data ?? [];
  const meta = data?.meta;

  const openModal = (type: 'approve' | 'reject', provider: AdminProviderSummary) => {
    setNoteInput('');
    setReasonInput('');
    setModal({ type, provider });
  };

  const handleConfirm = async () => {
    if (!modal) return;
    if (modal.type === 'approve') {
      await approve.mutateAsync({ id: modal.provider.id, note: noteInput || undefined });
    } else {
      if (!reasonInput.trim()) return;
      await reject.mutateAsync({ id: modal.provider.id, reason: reasonInput });
    }
    setModal(null);
  };

  const isPending = approve.isPending || reject.isPending;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Provider Approvals</h1>
        <p className="text-slate-500 text-sm mt-1">
          {meta ? `${meta.total} application${meta.total !== 1 ? 's' : ''} awaiting review` : 'Review provider applications'}
        </p>
      </div>

      {isFetching && providers.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-48 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-72" />
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <svg className="h-10 w-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-slate-600 font-medium">All clear — no pending applications</p>
        </div>
      ) : (
        <div className={cn('space-y-4', isFetching && 'opacity-70 transition-opacity')}>
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} onApprove={() => openModal('approve', p)} onReject={() => openModal('reject', p)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((n) => n - 1)} disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page} of {meta.totalPages}</span>
          <button onClick={() => setPage((n) => n + 1)} disabled={page >= meta.totalPages}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              {modal.type === 'approve' ? 'Approve provider' : 'Reject provider'}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              <strong>{modal.provider.businessName}</strong> ({modal.provider.user.email})
            </p>

            {modal.type === 'approve' ? (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Note <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Welcome message or any notes for the provider…"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Explain why this application cannot be approved…"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                {!reasonInput.trim() && <p className="text-xs text-red-500 mt-1">A reason is required</p>}
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
                disabled={isPending || (modal.type === 'reject' && !reasonInput.trim())}
                className={cn(
                  'px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60',
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

function ProviderCard({
  provider,
  onApprove,
  onReject,
}: {
  provider: AdminProviderSummary;
  onApprove: () => void;
  onReject: () => void;
}) {
  const submittedDate = new Date(provider.updatedAt).toLocaleDateString('en-AE', { dateStyle: 'medium' });
  const joinedDate = new Date(provider.user.createdAt).toLocaleDateString('en-AE', { dateStyle: 'medium' });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-slate-900">{provider.businessName}</h3>
          <p className="text-sm text-slate-500">{provider.businessType}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{provider.user.name} · {provider.user.email}</span>
            {provider.user.phone && <span>{provider.user.phone}</span>}
            <span>Joined {joinedDate}</span>
            <span>Submitted {submittedDate}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="text-sm font-semibold px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={onReject}
            className="text-sm font-semibold px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Details row */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
        <span>
          <strong className="text-slate-700">Showrooms:</strong>{' '}
          {provider.showrooms.map((s) => s.city).join(', ') || 'None'}
        </span>
        <span>
          <strong className="text-slate-700">Documents:</strong>{' '}
          {provider.documents.length} uploaded
          {provider.documents.some((d) => d.status !== 'APPROVED') && (
            <span className="text-amber-600 ml-1">(some unreviewed)</span>
          )}
        </span>
        <span>
          <strong className="text-slate-700">Vehicles:</strong> {provider._count.vehicles}
        </span>
      </div>
    </div>
  );
}
