'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Inbox, Image as ImageIcon, MapPin, Phone } from 'lucide-react';
import { useProviderInquiries, useUpdateBookingStatus } from '../../../../hooks/useBookings';
import type { BookingRequest, BookingStatus } from '../../../../lib/api/bookings.api';
import { cn } from '../../../../lib/utils/cn';
import { getCurrencyCode } from '../../../../lib/utils/currency';
import { formatDurationLabel } from '../../../../lib/utils/rentalDuration';
import { Button, Card, EmptyState, Pagination, SegmentedTabs, Textarea, WhatsAppButton } from '../../../../components/ui';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import * as Dialog from '@radix-ui/react-dialog';

const STATUS_TABS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
];

const INBOX_LABEL: Partial<Record<BookingStatus, string>> = { PENDING: 'New' };

export default function ProviderInquiriesPage() {
  const [activeStatus, setActiveStatus] = useState('');
  const [page, setPage] = useState(1);
  const [actionModal, setActionModal] = useState<{
    booking: BookingRequest;
    newStatus: BookingStatus;
  } | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const { data, isFetching } = useProviderInquiries((activeStatus || undefined) as BookingStatus | undefined, page);
  const updateStatus = useUpdateBookingStatus();

  const inquiries = data?.data ?? [];
  const meta = data?.meta;

  const handleTabChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
  };

  const openAction = (booking: BookingRequest, newStatus: BookingStatus) => {
    setNoteInput('');
    setActionModal({ booking, newStatus });
  };

  const confirmAction = async () => {
    if (!actionModal) return;
    await updateStatus.mutateAsync({
      id: actionModal.booking.id,
      data: { newStatus: actionModal.newStatus, note: noteInput || undefined },
    });
    setActionModal(null);
  };

  const modalTitle =
    actionModal?.newStatus === 'CONTACTED'
      ? 'Mark as Contacted'
      : actionModal?.newStatus === 'ACCEPTED'
        ? 'Accept inquiry'
        : 'Decline inquiry';

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Inquiries</h1>
        <p className="mt-1 text-sm text-text-muted">Manage booking requests from customers.</p>
      </div>

      {/* Status tab bar */}
      <SegmentedTabs options={STATUS_TABS} value={activeStatus} onChange={handleTabChange} className="mb-5" />

      {isFetching && inquiries.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-card border border-border-subtle bg-surface p-5">
              <div className="flex gap-3">
                <div className="h-16 w-20 flex-shrink-0 rounded-media bg-surface-hover" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded-control bg-surface-hover" />
                  <div className="h-3 w-60 rounded-control bg-surface-hover" />
                  <div className="h-3 w-32 rounded-control bg-surface-hover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No inquiries"
          description={activeStatus ? 'No inquiries with this status.' : 'Inquiries will appear here once customers send them.'}
        />
      ) : (
        <div className={cn('space-y-3', isFetching && 'pointer-events-none opacity-70 transition-opacity')}>
          {inquiries.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} onAction={openAction} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} className="mt-6" />
      )}

      {/* Status change modal */}
      <Dialog.Root open={!!actionModal} onOpenChange={(open) => !open && setActionModal(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sheet bg-surface p-6 shadow-lg focus:outline-none">
            <Dialog.Title className="mb-1 text-lg font-semibold text-ink">{modalTitle}</Dialog.Title>
            {actionModal && (
              <p className="mb-4 text-sm text-text-muted">
                Inquiry from <strong className="font-semibold text-ink">{actionModal.booking.user.name}</strong> for{' '}
                <strong className="font-semibold text-ink">{actionModal.booking.vehicle.title}</strong>.
              </p>
            )}

            <Textarea
              label="Note for customer"
              helper="Optional"
              rows={3}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={
                actionModal?.newStatus === 'REJECTED'
                  ? 'Let them know why, or suggest an alternative…'
                  : 'Any additional information for the customer…'
              }
              wrapperClassName="mb-5"
            />

            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
              <Button
                variant={actionModal?.newStatus === 'REJECTED' ? 'danger' : 'primary'}
                loading={updateStatus.isPending}
                onClick={confirmAction}
              >
                Confirm
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function InquiryCard({
  inquiry,
  onAction,
}: {
  inquiry: BookingRequest;
  onAction: (booking: BookingRequest, newStatus: BookingStatus) => void;
}) {
  const fromDate = new Date(inquiry.requestedFromDate).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' });
  const toDate = new Date(inquiry.requestedToDate).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' });
  const durationLabel =
    inquiry.durationType && inquiry.durationQuantity
      ? formatDurationLabel(inquiry.durationType, inquiry.durationQuantity)
      : null;
  const thumb = inquiry.vehicle.images?.[0]?.url;

  return (
    <Card hover>
      <div className="flex gap-4">
        {/* Vehicle thumbnail */}
        <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-media bg-surface-hover">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt={inquiry.vehicle.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-faint">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link href={`/vehicles/${inquiry.vehicle.slug}`} className="text-sm font-semibold text-ink hover:text-brand-600">
                {inquiry.vehicle.title}
              </Link>
              <p className="mt-0.5 text-xs text-text-muted">
                {inquiry.user.name} · {inquiry.user.email}
              </p>
              {inquiry.user.phone && (
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono text-xs text-text-muted">
                    <Phone className="h-3 w-3" />
                    {inquiry.user.phone}
                  </span>
                  <WhatsAppButton phone={inquiry.user.phone} variant="text" label="WhatsApp customer" />
                </div>
              )}
            </div>
            <StatusBadge status={inquiry.status} size="sm" label={INBOX_LABEL[inquiry.status]} />
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-text-muted">
            <span>
              {fromDate} → {toDate}
              {durationLabel && ` (${durationLabel})`}
            </span>
            {inquiry.totalPrice != null && (
              <span>
                {getCurrencyCode(inquiry.vehicle.showroom?.country)}{' '}
                {Number(inquiry.totalPrice).toLocaleString()} est.
              </span>
            )}
            {inquiry.pickupLocation && (
              <span className="flex items-center gap-1 font-sans">
                <MapPin className="h-3 w-3" />
                {inquiry.pickupLocation}
              </span>
            )}
          </div>

          {inquiry.message && (
            <p className="mt-2 line-clamp-2 rounded-control bg-page px-3 py-2 text-xs text-slate-600">&ldquo;{inquiry.message}&rdquo;</p>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {inquiry.status === 'PENDING' && (
              <>
                <Button size="sm" variant="primary" onClick={() => onAction(inquiry, 'CONTACTED')}>
                  Mark contacted
                </Button>
                <Button size="sm" variant="danger-outline" onClick={() => onAction(inquiry, 'REJECTED')}>
                  Decline
                </Button>
              </>
            )}
            {inquiry.status === 'CONTACTED' && (
              <>
                <Button size="sm" variant="primary" onClick={() => onAction(inquiry, 'ACCEPTED')}>
                  Accept
                </Button>
                <Button size="sm" variant="danger-outline" onClick={() => onAction(inquiry, 'REJECTED')}>
                  Decline
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
