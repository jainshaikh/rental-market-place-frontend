'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTrip } from '../../hooks/useTrips';
import { useMyApprovedUserVehicles } from '../../hooks/useUserVehicles';
import { tripSchema, type TripFormValues } from '../../lib/validations/trip.schema';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white disabled:bg-slate-50 disabled:text-slate-400';

interface TripFormProps {
  cancelHref: string;
  detailBasePath: string; // e.g. '/dashboard/trips' — redirected to `${detailBasePath}/${id}` on success
  addVehicleHref: string; // e.g. '/dashboard/my-vehicles/new'
}

export function TripForm({ cancelHref, detailBasePath, addVehicleHref }: TripFormProps) {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const { data: vehicles, isLoading: vehiclesLoading } = useMyApprovedUserVehicles();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: { availableSeats: 3 },
  });

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
    return <div className="max-w-2xl animate-pulse h-96 bg-white rounded-xl border border-slate-200" />;
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-semibold text-slate-800">No approved vehicles yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Register a vehicle and get it verified before you can post a trip.
        </p>
        <Link href={addVehicleHref} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          Add a vehicle →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Post a trip</h1>
        <p className="mt-1 text-sm text-slate-500">
          Announce a city-to-city trip. It goes live immediately — riders will contact you directly on WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-800">Vehicle</p>
          <div>
            <Label required>Which vehicle is making this trip?</Label>
            <select {...register('userVehicleId')} className={inputCls} defaultValue="">
              <option value="" disabled>Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model}{v.year ? ` (${v.year})` : ''} · Plate {v.plateNumber}
                </option>
              ))}
            </select>
            <FieldError message={errors.userVehicleId?.message} />
            <Link href={addVehicleHref} className="mt-1.5 inline-block text-xs text-primary hover:underline">
              + Register another vehicle
            </Link>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-800">Route</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>From city</Label>
              <input {...register('originCity')} placeholder="e.g. Hyderabad" className={inputCls} />
              <FieldError message={errors.originCity?.message} />
            </div>
            <div>
              <Label required>To city</Label>
              <input {...register('destinationCity')} placeholder="e.g. Karachi" className={inputCls} />
              <FieldError message={errors.destinationCity?.message} />
            </div>
          </div>

          <div>
            <Label required>Pickup point</Label>
            <input
              {...register('pickupPoint')}
              placeholder="e.g. Liaquatabad Chowrangi, near Total Petrol Pump"
              className={inputCls}
            />
            <FieldError message={errors.pickupPoint?.message} />
          </div>

          <div>
            <Label>Drop-off point</Label>
            <input
              {...register('dropoffPoint')}
              placeholder="e.g. Karachi Cantt Station"
              className={inputCls}
            />
          </div>

          <div>
            <Label required>Departure date & time</Label>
            <input type="datetime-local" {...register('departureAt')} className={inputCls} />
            <FieldError message={errors.departureAt?.message} />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-800">Seats & pricing</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Available seats</Label>
              <input
                type="number"
                {...register('availableSeats', { valueAsNumber: true })}
                placeholder="3"
                className={inputCls}
              />
              <FieldError message={errors.availableSeats?.message} />
            </div>
            <div>
              <Label required>Price per seat (PKR)</Label>
              <input
                type="number"
                step="0.01"
                {...register('pricePerSeat', { valueAsNumber: true })}
                placeholder="1500"
                className={inputCls}
              />
              <FieldError message={errors.pricePerSeat?.message} />
            </div>
          </div>

          <div>
            <Label required>WhatsApp contact number</Label>
            <input {...register('contactNumber')} placeholder="+923001234567" className={inputCls} />
            <FieldError message={errors.contactNumber?.message} />
          </div>

          <div>
            <Label>Notes</Label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="e.g. AC available, one small bag per seat"
              className={`${inputCls} resize-none`}
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(cancelHref)}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? 'Posting…' : 'Post trip'}
          </button>
        </div>
      </form>
    </div>
  );
}
