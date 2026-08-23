'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Minus, Plus } from 'lucide-react';
import { useAuth } from '../../../../../hooks/useAuth';
import { useCreateTripInquiry } from '../../../../../hooks/useTripInquiries';
import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '../../../../../lib/api/trips.api';
import { getCurrencyCode } from '../../../../../lib/utils/currency';
import {
  createTripInquirySchema,
  type CreateTripInquiryFormValues,
} from '../../../../../lib/validations/trip-inquiry.schema';
import { Button, Card, Input, Textarea } from '../../../../../components/ui';

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function TripInquirePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const createInquiry = useCreateTripInquiry();
  const [submitted, setSubmitted] = useState(false);

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', params.id],
    queryFn: () => tripsApi.getById(params.id),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTripInquiryFormValues>({
    resolver: zodResolver(createTripInquirySchema),
    defaultValues: { tripId: params.id, requestedSeats: 1 },
  });

  const requestedSeats = watch('requestedSeats') ?? 1;

  if (!authLoading && !user) {
    router.replace(`/login?redirect=/trips/${params.id}/inquire`);
    return null;
  }

  if (authLoading || tripLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-slate-600">Trip not found.</p>
        <Link href="/trips" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Browse all trips
        </Link>
      </div>
    );
  }

  const maxSeats = Math.max(1, trip.availableSeats);

  const onSubmit = async (values: CreateTripInquiryFormValues) => {
    const result = await createInquiry.mutateAsync({
      tripId: values.tripId,
      requestedSeats: values.requestedSeats,
      pickupNote: values.pickupNote || undefined,
      message: values.message || undefined,
    });
    if (result) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-status-emerald-bg">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-ink">Request sent!</h1>
        <p className="mb-6 text-text-muted">
          <strong className="font-semibold text-ink">{trip.postedBy.name}</strong> has been notified and will accept
          or decline your request soon.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard/trip-inquiries">
            <Button variant="primary">View my requests</Button>
          </Link>
          <Link href="/trips">
            <Button variant="secondary">Browse more trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (trip.availableSeats <= 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-slate-600">This trip is full — no seats remaining.</p>
        <Link href={`/trips/${params.id}`} className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Back to trip
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <nav className="mb-5 flex items-center gap-2 text-xs text-text-muted">
        <Link href="/trips" className="hover:text-slate-700">
          Trips
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-border-strong" />
        <Link href={`/trips/${params.id}`} className="hover:text-slate-700">
          {titleCase(trip.originCity)} → {titleCase(trip.destinationCity)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-border-strong" />
        <span className="font-semibold text-ink">Request seats</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
        <div className="sm:col-span-3">
          <h1 className="mb-1 text-2xl font-bold text-ink">Request seats</h1>
          <p className="mb-6 text-sm text-text-muted">
            {trip.postedBy.name} will accept or decline — you'll be notified either way.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('tripId')} />

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-slate-700">Seats needed</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setValue('requestedSeats', Math.max(1, requestedSeats - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-control border border-border-strong text-slate-700 hover:bg-surface-hover disabled:opacity-40"
                  disabled={requestedSeats <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-mono text-lg font-semibold text-ink">{requestedSeats}</span>
                <button
                  type="button"
                  onClick={() => setValue('requestedSeats', Math.min(maxSeats, requestedSeats + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-control border border-border-strong text-slate-700 hover:bg-surface-hover disabled:opacity-40"
                  disabled={requestedSeats >= maxSeats}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="text-xs text-text-faint">{trip.availableSeats} available</span>
              </div>
              {errors.requestedSeats && <p className="mt-1.5 text-xs text-red-700">{errors.requestedSeats.message}</p>}
            </div>

            <Input
              label="Pickup note"
              helper="Optional — e.g. a landmark near the pickup point"
              placeholder="e.g. Near the mosque, not the main gate"
              {...register('pickupNote')}
            />

            <Textarea
              label="Message"
              helper="Optional"
              placeholder="Introduce yourself or ask a question…"
              error={errors.message?.message}
              {...register('message')}
            />

            {createInquiry.error && (
              <div className="rounded-control border border-status-red-border bg-status-red-bg px-4 py-3 text-sm text-status-red-fg">
                {(createInquiry.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                  'Something went wrong. Please try again.'}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting || createInquiry.isPending}>
              Send request
            </Button>
          </form>
        </div>

        <div className="sm:col-span-2">
          <Card className="sticky top-24 space-y-4">
            <div>
              <p className="font-semibold text-ink">
                {titleCase(trip.originCity)} → {titleCase(trip.destinationCity)}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {new Date(trip.departureAt).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>

            <div className="space-y-2 border-t border-border-subtle pt-3 text-sm">
              <div className="flex justify-between font-mono text-slate-600">
                <span>{getCurrencyCode(trip.userVehicle?.country)} {Number(trip.pricePerSeat).toLocaleString()} / seat</span>
              </div>
              <div className="flex justify-between font-mono font-semibold text-ink">
                <span className="font-sans">
                  {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}
                </span>
                <span>{getCurrencyCode(trip.userVehicle?.country)} {(Number(trip.pricePerSeat) * requestedSeats).toLocaleString()} est.</span>
              </div>
            </div>

            <p className="pt-1 text-xs text-text-faint">
              Estimate only — confirm final price directly with {trip.postedBy.name}.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
