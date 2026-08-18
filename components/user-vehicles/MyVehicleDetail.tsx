'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMyUserVehicle } from '../../hooks/useUserVehicles';
import { StatusBadge } from '../common/StatusBadge';

const DOC_LABELS: Record<string, string> = {
  ID_DOCUMENT: 'CNIC (National ID)',
  ID_DOCUMENT_FRONT: 'CNIC (National ID) — front',
  ID_DOCUMENT_BACK: 'CNIC (National ID) — back',
  DRIVING_LICENSE: 'Driving license',
  VEHICLE_REGISTRATION: 'Vehicle registration',
};

interface MyVehicleDetailProps {
  backHref: string; // e.g. '/dashboard/my-vehicles'
}

export function MyVehicleDetail({ backHref }: MyVehicleDetailProps) {
  const params = useParams();
  const id = params.id as string;
  const { data: vehicle, isLoading, isError } = useMyUserVehicle(id);

  if (isLoading) {
    return <div className="max-w-2xl animate-pulse h-64 bg-white rounded-xl border border-slate-200" />;
  }

  if (isError || !vehicle) {
    return (
      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-semibold text-slate-800">Vehicle not found</p>
        <Link href={backHref} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          Back to vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href={backHref} className="hover:text-slate-600">My Vehicles</Link>
        <span>/</span>
        <span className="truncate text-slate-700">{vehicle.make} {vehicle.model}</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-slate-900">
            {vehicle.make} {vehicle.model}{vehicle.year ? ` (${vehicle.year})` : ''}
          </h1>
          <StatusBadge status={vehicle.status} />
        </div>

        {vehicle.status === 'PENDING_REVIEW' && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 inline-block">
            Awaiting document verification — you can&apos;t post trips with this vehicle yet.
          </p>
        )}
        {vehicle.status === 'REJECTED' && vehicle.rejectionReason && (
          <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 inline-block">
            Rejected: {vehicle.rejectionReason}
          </p>
        )}
        {vehicle.status === 'SUSPENDED' && (
          <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 inline-block">
            This vehicle was suspended and can&apos;t be used for new trips.
          </p>
        )}

        <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">Plate number</p>
            <p className="text-slate-700">{vehicle.plateNumber}</p>
          </div>
          {vehicle.color && (
            <div>
              <p className="text-xs text-slate-400">Color</p>
              <p className="text-slate-700">{vehicle.color}</p>
            </div>
          )}
        </div>
      </div>

      {vehicle.images.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Photos</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {vehicle.images.map((image, index) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                <Image src={image.url} alt="" fill className="object-cover" sizes="150px" />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Poster
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Verification documents</h2>
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
      </div>
    </div>
  );
}
