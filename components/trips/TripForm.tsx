'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CarFront, Plus } from 'lucide-react';
import { useCreateTrip } from '../../hooks/useTrips';
import { useMyApprovedUserVehicles } from '../../hooks/useUserVehicles';
import { tripSchema, type TripFormValues } from '../../lib/validations/trip.schema';
import { getCurrencyCode } from '../../lib/utils/currency';
import { Button, Card, EmptyState, Input, Select, Textarea } from '../ui';

interface TripFormProps {
  cancelHref: string;
  detailBasePath: string; // e.g. '/dashboard/trips' — redirected to `${detailBasePath}/${id}` on success
  addVehicleHref: string; // e.g. '/dashboard/my-vehicles/new'
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-[18px] p-5">
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
        {title}
      </p>
      {children}
    </Card>
  );
}

export function TripForm({ cancelHref, detailBasePath, addVehicleHref }: TripFormProps) {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const { data: vehicles, isLoading: vehiclesLoading } = useMyApprovedUserVehicles();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: { availableSeats: 3 },
  });

  // A vehicle owner's registered vehicles could in principle span markets, so
  // the currency follows whichever vehicle is actually selected, not a fixed default.
  const selectedVehicleId = watch('userVehicleId');
  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);
  const currency = getCurrencyCode(selectedVehicle?.country);

  const onSubmit = async (values: TripFormValues) => {
    const result = await createTrip.mutateAsync({
      ...values,
      dropoffPoint: values.dropoffPoint || undefined,
      notes: values.notes || undefined,
      departureAt: new Date(values.departureAt).toISOString(),
    });

    router.push(`${detailBasePath}/${result.id}`);
  };

  if (vehiclesLoading) {
    return (
      <div className="h-96 max-w-2xl animate-pulse rounded-card border border-border-subtle bg-surface" />
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="max-w-2xl">
        <EmptyState
          icon={CarFront}
          title="No approved vehicles yet"
          description="Register a vehicle and get it verified before you can post a trip."
          action={{ label: 'Add a vehicle', onClick: () => router.push(addVehicleHref) }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.035em] text-ink">Post a trip</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
          Announce a city-to-city trip. It goes live immediately — riders will contact you directly
          on WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Section title="Vehicle">
          <div>
            <Select
              label="Which vehicle is making this trip?"
              required
              defaultValue=""
              error={errors.userVehicleId?.message}
              {...register('userVehicleId')}
            >
              <option value="" disabled>
                Select a vehicle
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model}
                  {v.year ? ` (${v.year})` : ''} · Plate {v.plateNumber}
                </option>
              ))}
            </Select>
            <Link
              href={addVehicleHref}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Register another vehicle
            </Link>
          </div>
        </Section>

        <Section title="Route">
          <div className="grid gap-[18px] sm:grid-cols-2">
            <Input
              label="From city"
              required
              placeholder="e.g. Hyderabad"
              error={errors.originCity?.message}
              {...register('originCity')}
            />
            <Input
              label="To city"
              required
              placeholder="e.g. Karachi"
              error={errors.destinationCity?.message}
              {...register('destinationCity')}
            />
          </div>

          <Input
            label="Pickup point"
            required
            placeholder="e.g. Liaquatabad Chowrangi, near Total Petrol Pump"
            error={errors.pickupPoint?.message}
            {...register('pickupPoint')}
          />

          <Input
            label="Drop-off point"
            placeholder="e.g. Karachi Cantt Station"
            {...register('dropoffPoint')}
          />

          <Input
            type="datetime-local"
            label="Departure date & time"
            required
            error={errors.departureAt?.message}
            {...register('departureAt')}
          />
        </Section>

        <Section title="Seats & pricing">
          <div className="grid gap-[18px] sm:grid-cols-2">
            <Input
              type="number"
              label="Available seats"
              required
              placeholder="3"
              error={errors.availableSeats?.message}
              {...register('availableSeats', { valueAsNumber: true })}
            />
            <Input
              type="number"
              step="0.01"
              label={`Price per seat (${currency})`}
              required
              placeholder="1500"
              error={errors.pricePerSeat?.message}
              {...register('pricePerSeat', { valueAsNumber: true })}
            />
          </div>

          <Input
            label="WhatsApp contact number"
            required
            placeholder="+923001234567"
            helper="Riders will message this number directly."
            error={errors.contactNumber?.message}
            {...register('contactNumber')}
          />

          <Textarea
            label="Notes"
            rows={2}
            placeholder="e.g. AC available, one small bag per seat"
            className="resize-none"
            {...register('notes')}
          />
        </Section>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => router.push(cancelHref)}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-1" loading={isSubmitting}>
            {isSubmitting ? 'Posting…' : 'Post trip'}
          </Button>
        </div>
      </form>
    </div>
  );
}
