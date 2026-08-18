'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useAdminUserVehicleDetail,
  useApproveUserVehicle,
  useRejectUserVehicle,
  useSuspendUserVehicle,
  useReactivateUserVehicle,
} from '../../../../../hooks/useAdmin';
import { StatusBadge } from '../../../../../components/common/StatusBadge';

const DOC_LABELS: Record<string, string> = {
  ID_DOCUMENT: 'CNIC (National ID)',
  DRIVING_LICENSE: 'Driving license',
  VEHICLE_REGISTRATION: 'Vehicle registration',
};

export default function AdminUserVehicleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: vehicle, isLoading, isError } = useAdminUserVehicleDetail(id);
  const approve = useApproveUserVehicle();
  const reject = useRejectUserVehicle();
  const suspend = useSuspendUserVehicle();
  const reactivate = useReactivateUserVehicle();
  const [showReject, setShowReject] = useState(false);
  const [reasonInput, setReasonInput] = useState('');

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-5">
        <div className="h-4 bg-slate-100 rounded w-24" />
        <div className="h-40 bg-white rounded-xl border border-slate-200" />
        <div className="h-48 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-medium">Vehicle not found</p>
        <Link href="/admin/user-vehicles" className="text-sm text-primary hover:underline mt-2 inline-block">
          Back to vehicles
        </Link>
      </div>
    );
  }

  const handleReject = async () => {
    if (!reasonInput.trim()) return;
    await reject.mutateAsync({ id: vehicle.id, reason: reasonInput });
    setShowReject(false);
  };

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/admin/user-vehicles" className="hover:text-slate-600">Vehicle Verifications</Link>
        <span>/</span>
        <span className="truncate text-slate-700">{vehicle.make} {vehicle.model}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {vehicle.make} {vehicle.model}{vehicle.year ? ` (${vehicle.year})` : ''}
              </h1>
              <StatusBadge status={vehicle.status} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Plate {vehicle.plateNumber}{vehicle.color ? ` · ${vehicle.color}` : ''}
            </p>
            {vehicle.rejectionReason && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3 inline-block">
                Rejected: {vehicle.rejectionReason}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {vehicle.status === 'PENDING_REVIEW' && (
              <>
                <button
                  onClick={() => approve.mutate(vehicle.id)}
                  disabled={approve.isPending}
                  className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                >
                  {approve.isPending ? 'Approving…' : 'Approve'}
                </button>
                <button
                  onClick={() => { setShowReject(true); setReasonInput(''); }}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Reject
                </button>
              </>
            )}
            {vehicle.status === 'APPROVED' && (
              <button
                onClick={() => suspend.mutate(vehicle.id)}
                disabled={suspend.isPending}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {suspend.isPending ? 'Suspending…' : 'Suspend'}
              </button>
            )}
            {vehicle.status === 'SUSPENDED' && (
              <button
                onClick={() => reactivate.mutate(vehicle.id)}
                disabled={reactivate.isPending}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
              >
                {reactivate.isPending ? 'Reactivating…' : 'Reactivate'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Owner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Owner</h2>
        <p className="font-semibold text-slate-900">{vehicle.owner.name}</p>
        <div className="mt-1 text-sm text-slate-500 space-x-3">
          <span>{vehicle.owner.email}</span>
          {vehicle.owner.phone && <span>{vehicle.owner.phone}</span>}
        </div>
        <Link
          href={`/admin/users/${vehicle.owner.id}`}
          className="inline-block mt-3 text-sm font-semibold text-primary hover:underline"
        >
          View user profile →
        </Link>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Verification documents</h2>
        {!vehicle.documents || vehicle.documents.length === 0 ? (
          <p className="text-sm text-slate-400">No documents on file</p>
        ) : (
          <ul className="space-y-2">
            {vehicle.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between text-sm">
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-primary hover:underline">
                  {DOC_LABELS[doc.documentType] ?? doc.documentType}
                </a>
                <span className="text-xs font-semibold text-slate-400">{doc.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reject modal */}
      {showReject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Reject vehicle</h2>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g. CNIC photo is unreadable"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowReject(false)}
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
