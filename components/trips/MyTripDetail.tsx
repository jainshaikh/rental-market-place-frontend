'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useMyTrip, useCancelTrip } from '../../hooks/useTrips';
import { useTripInquiryInbox, useUpdateTripInquiryStatus } from '../../hooks/useTripInquiries';
import { StatusBadge } from '../common/StatusBadge';

interface MyTripDetailProps {
  backHref: string; // e.g. '/dashboard/trips'
  vehicleBasePath: string; // e.g. '/dashboard/my-vehicles'
}

export function MyTripDetail({ backHref, vehicleBasePath }: MyTripDetailProps) {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: trip, isLoading, isError } = useMyTrip(id);
  const cancelTrip = useCancelTrip();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: inquiriesRes, isLoading: inquiriesLoading } = useTripInquiryInbox({ tripId: id });
  const updateInquiryStatus = useUpdateTripInquiryStatus();
  const [rejectModal, setRejectModal] = useState<{ inquiryId: string } | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  if (isLoading) {
    return <div className="max-w-2xl animate-pulse h-80 bg-white rounded-xl border border-slate-200" />;
  }

  if (isError || !trip) {
    return (
      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-semibold text-slate-800">Trip not found</p>
        <Link href={backHref} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          Back to trips
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href={backHref} className="hover:text-slate-600">Trips</Link>
        <span>/</span>
        <span className="truncate text-slate-700">{trip.originCity} → {trip.destinationCity}</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">
                {trip.originCity.charAt(0).toUpperCase() + trip.originCity.slice(1)}
                {' → '}
                {trip.destinationCity.charAt(0).toUpperCase() + trip.destinationCity.slice(1)}
              </h1>
              <StatusBadge status={trip.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {new Date(trip.departureAt).toLocaleString('en-AE', { dateStyle: 'full', timeStyle: 'short' })}
            </p>
            {trip.status === 'CANCELLED' && trip.cancelReason && (
              <p className="mt-2 text-xs text-slate-600 bg-slate-100 rounded-lg px-3 py-2 inline-block">
                Cancelled: {trip.cancelReason}
              </p>
            )}
          </div>

          {trip.status === 'ACTIVE' && (
            <button
              onClick={() => setConfirmCancel(true)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Cancel trip
            </button>
          )}
        </div>

        {trip.userVehicle.images.length > 0 && (
          <div className="mt-5 flex gap-2 overflow-x-auto">
            {trip.userVehicle.images.map((image) => (
              <div key={image.url} className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200">
                <Image src={image.url} alt="" fill className="object-cover" sizes="112px" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">Vehicle</p>
            <Link
              href={`${vehicleBasePath}/${trip.userVehicle.id}`}
              className="text-primary hover:underline"
            >
              {trip.userVehicle.make} {trip.userVehicle.model}{trip.userVehicle.year ? ` (${trip.userVehicle.year})` : ''}
            </Link>
          </div>
          <div>
            <p className="text-xs text-slate-400">Plate number</p>
            <p className="text-slate-700">{trip.userVehicle.plateNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Seats available</p>
            <p className="text-slate-700">{trip.availableSeats}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Price per seat</p>
            <p className="text-slate-700">PKR {Number(trip.pricePerSeat).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">WhatsApp contact</p>
            <p className="text-slate-700">{trip.contactNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Pickup point</p>
            <p className="text-slate-700">{trip.pickupPoint}</p>
          </div>
          {trip.dropoffPoint && (
            <div>
              <p className="text-xs text-slate-400">Drop-off point</p>
              <p className="text-slate-700">{trip.dropoffPoint}</p>
            </div>
          )}
        </div>

        {trip.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">Notes</p>
            <p className="text-sm text-slate-700 mt-0.5">{trip.notes}</p>
          </div>
        )}
      </div>

      {/* Incoming seat requests */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Incoming requests</h2>

        {inquiriesLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : !inquiriesRes?.data.length ? (
          <p className="text-sm text-slate-400">No requests yet — riders who ask for a seat will show up here.</p>
        ) : (
          <div className="space-y-3">
            {inquiriesRes.data.map((inquiry) => (
              <div key={inquiry.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {inquiry.user.name} · {inquiry.requestedSeats} seat{inquiry.requestedSeats !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {inquiry.user.phone ?? inquiry.user.email}
                      {inquiry.pickupNote ? ` · ${inquiry.pickupNote}` : ''}
                    </p>
                    {inquiry.message && (
                      <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                        &ldquo;{inquiry.message}&rdquo;
                      </p>
                    )}
                  </div>
                  <StatusBadge
                    status={inquiry.status}
                    label={
                      inquiry.status === 'PENDING'
                        ? 'New'
                        : inquiry.status === 'ACCEPTED'
                          ? 'Accepted'
                          : inquiry.status === 'REJECTED'
                            ? 'Declined'
                            : 'Cancelled'
                    }
                  />
                </div>

                {inquiry.status === 'PENDING' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        updateInquiryStatus.mutate({ id: inquiry.id, data: { newStatus: 'ACCEPTED' } })
                      }
                      disabled={updateInquiryStatus.isPending}
                      className="text-xs font-semibold px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        setRejectNote('');
                        setRejectModal({ inquiryId: inquiry.id });
                      }}
                      className="text-xs font-semibold px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Decline this request?</h3>
            <p className="mt-1 text-sm text-slate-500">Let the rider know why, or suggest an alternative.</p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Optional note for the rider…"
              className="mt-3 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Keep pending
              </button>
              <button
                onClick={async () => {
                  await updateInquiryStatus.mutateAsync({
                    id: rejectModal.inquiryId,
                    data: { newStatus: 'REJECTED', note: rejectNote || undefined },
                  });
                  setRejectModal(null);
                }}
                disabled={updateInquiryStatus.isPending}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {updateInquiryStatus.isPending ? 'Declining…' : 'Decline request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Cancel this trip?</h3>
            <p className="mt-1 text-sm text-slate-500">
              Riders will no longer be able to find or contact you for this trip.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Keep it
              </button>
              <button
                onClick={async () => {
                  await cancelTrip.mutateAsync({ id: trip.id });
                  setConfirmCancel(false);
                  router.push(backHref);
                }}
                disabled={cancelTrip.isPending}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelTrip.isPending ? 'Cancelling…' : 'Cancel trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
