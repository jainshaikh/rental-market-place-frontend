'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../../../../hooks/useAuth';
import { useCreateBooking } from '../../../../../hooks/useBookings';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '../../../../../lib/api/listings.api';
import { getCurrencyCode } from '../../../../../lib/utils/currency';
import {
  createBookingSchema,
  type CreateBookingFormValues,
} from '../../../../../lib/validations/booking.schema';
import { Button, Card, Input, Textarea } from '../../../../../components/ui';

export default function InquirePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const createBooking = useCreateBooking();
  const [submitted, setSubmitted] = useState(false);

  const { data: vehicleRes, isLoading: vehicleLoading } = useQuery({
    queryKey: ['listing', params.slug],
    queryFn: () => listingsApi.getBySlug(params.slug),
  });
  const vehicle = vehicleRes;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookingFormValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: { vehicleId: '' },
  });

  useEffect(() => {
    if (vehicle?.id) setValue('vehicleId', vehicle.id);
  }, [vehicle?.id, setValue]);

  // Redirect unauthenticated users to login
  if (!authLoading && !user) {
    router.replace(`/login?redirect=/vehicles/${params.slug}/inquire`);
    return null;
  }

  if (authLoading || vehicleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-slate-600">Vehicle not found.</p>
        <Link href="/vehicles" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Browse all vehicles
        </Link>
      </div>
    );
  }

  const onSubmit = async (values: CreateBookingFormValues) => {
    const result = await createBooking.mutateAsync({
      vehicleId: values.vehicleId,
      requestedFromDate: values.requestedFromDate,
      requestedToDate: values.requestedToDate,
      pickupLocation: values.pickupLocation || undefined,
      message: values.message || undefined,
    });
    if (result) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-status-emerald-bg">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-ink">Inquiry sent!</h1>
        <p className="mb-6 text-text-muted">
          The provider for <strong className="font-semibold text-ink">{vehicle.title}</strong> has
          been notified and will be in touch with you soon.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard/inquiries">
            <Button variant="primary">View my inquiries</Button>
          </Link>
          <Link href="/vehicles">
            <Button variant="secondary">Browse more vehicles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = Number(vehicle.pricePerDay).toLocaleString();
  const fromDate = watch('requestedFromDate');
  const toDate = watch('requestedToDate');
  const days =
    fromDate && toDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  // datetime-local inputs need "YYYY-MM-DDTHH:mm" in local time, not UTC —
  // toISOString() would shift by the timezone offset and let past times through.
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-xs text-text-muted">
        <Link href="/vehicles" className="hover:text-slate-700">
          Vehicles
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-border-strong" />
        <Link
          href={`/vehicles/${params.slug}`}
          className="max-w-[160px] truncate hover:text-slate-700"
        >
          {vehicle.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-border-strong" />
        <span className="font-semibold text-ink">Inquire</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
        {/* Form */}
        <div className="sm:col-span-3">
          <h1 className="mb-1 text-2xl font-bold text-ink">Send an inquiry</h1>
          <p className="mb-6 text-sm text-text-muted">
            Free to inquire — no payment until you agree terms with the provider.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('vehicleId')} />

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="datetime-local"
                label="Pick-up date & time"
                min={today}
                error={errors.requestedFromDate?.message}
                {...register('requestedFromDate')}
              />
              <Input
                type="datetime-local"
                label="Return date & time"
                min={fromDate || today}
                error={errors.requestedToDate?.message}
                {...register('requestedToDate')}
              />
            </div>

            <Input
              label="Preferred pick-up location"
              helper="Optional"
              placeholder="e.g. showroom pickup, hotel delivery…"
              {...register('pickupLocation')}
            />

            <Textarea
              label="Message"
              helper="Optional"
              placeholder="Introduce yourself, ask about availability, special requirements…"
              error={errors.message?.message}
              {...register('message')}
            />

            {createBooking.error && (
              <div className="rounded-control border border-status-red-border bg-status-red-bg px-4 py-3 text-sm text-status-red-fg">
                {(createBooking.error as { response?: { data?: { message?: string } } })?.response
                  ?.data?.message ?? 'Something went wrong. Please try again.'}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isSubmitting || createBooking.isPending}
            >
              Send inquiry
            </Button>
          </form>
        </div>

        {/* Summary card */}
        <div className="sm:col-span-2">
          <Card className="sticky top-24 space-y-4">
            {/* Vehicle thumbnail */}
            <div className="aspect-[4/3] overflow-hidden rounded-control bg-surface-hover">
              {vehicle.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={vehicle.images[0].url}
                  alt={vehicle.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text-faint">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
            </div>

            <div>
              <p className="font-semibold text-ink">{vehicle.title}</p>
              <p className="text-sm text-text-muted">{vehicle.providerProfile.businessName}</p>
            </div>

            <div className="space-y-2 border-t border-border-subtle pt-3 text-sm">
              <div className="flex justify-between font-mono text-slate-600">
                <span>{getCurrencyCode(vehicle.showroom?.country)} {price} / day</span>
              </div>
              {days > 0 && (
                <div className="flex justify-between font-mono font-semibold text-ink">
                  <span className="font-sans">
                    {days} day{days !== 1 ? 's' : ''}
                  </span>
                  <span>{getCurrencyCode(vehicle.showroom?.country)} {(Number(vehicle.pricePerDay) * days).toLocaleString()} est.</span>
                </div>
              )}
            </div>

            <p className="pt-1 text-xs text-text-faint">
              Estimate only — final pricing confirmed by the provider.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
