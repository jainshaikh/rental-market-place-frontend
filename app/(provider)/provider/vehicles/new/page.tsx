'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateVehicle } from '../../../../../hooks/useVehicles';
import { useProviderProfile } from '../../../../../hooks/useProviderProfile';
import {
  vehicleSchema,
  type VehicleFormValues,
  TRANSMISSION_OPTIONS,
  FUEL_TYPE_OPTIONS,
  COMMON_FEATURES,
} from '../../../../../lib/validations/vehicle.schema';
import { cn } from '../../../../../lib/utils/cn';
import { getCurrencyCode } from '../../../../../lib/utils/currency';
import { TrackEvent } from '../../../../../components/common/TrackEvent';

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

export default function NewVehiclePage() {
  const router = useRouter();
  const { data: profile, isLoading: isProfileLoading } = useProviderProfile();
  const createVehicle = useCreateVehicle();
  const currency = getCurrencyCode(profile?.showrooms?.[0]?.country);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      transmission: 'AUTOMATIC',
      fuelType: 'PETROL',
      seatingCapacity: 5,
      features: [],
    },
  });

  const selectedFeatures = watch('features') ?? [];

  const toggleFeature = (feature: string) => {
    const current = selectedFeatures;
    if (current.includes(feature)) {
      setValue(
        'features',
        current.filter((f) => f !== feature),
        { shouldValidate: true },
      );
    } else {
      setValue('features', [...current, feature], { shouldValidate: true });
    }
  };

  const showroom = profile?.showrooms?.[0];

  const onSubmit = async (values: VehicleFormValues) => {
    const result = await createVehicle.mutateAsync({
      ...values,
      engineType: values.engineType || undefined,
      availabilityNotes: values.availabilityNotes || undefined,
      pricingNotes: values.pricingNotes || undefined,
      specialConditions: values.specialConditions || undefined,
      showroomId: showroom?.id,
      pricePerWeek: values.pricePerWeek ?? undefined,
    });

    router.push(`/provider/vehicles/${result.data.id}/edit`);
  };

  const canAddVehicle = profile?.verificationStatus === 'APPROVED' && !!showroom;

  if (!isProfileLoading && !canAddVehicle) {
    return (
      <div className="max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-semibold text-amber-900">Not ready to add vehicles yet</h1>
        <p className="mt-2 text-sm text-amber-800">
          Before you can add vehicles, your profile needs:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-amber-800">
          {profile?.verificationStatus !== 'APPROVED' && <li>• Admin approval of your provider profile</li>}
          {!showroom && <li>• A showroom added to your profile</li>}
        </ul>
        <button
          type="button"
          onClick={() => router.push('/provider/profile')}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Go to profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <TrackEvent name="list_vehicle_start" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add a vehicle</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the details below. You can add photos and submit for review afterwards.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-800">Basic information</p>

          <div>
            <Label required>Listing title</Label>
            <input
              {...register('title')}
              placeholder="e.g. 2023 Toyota Camry SE"
              className={inputCls}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Make</Label>
              <input {...register('make')} placeholder="e.g. Toyota" className={inputCls} />
              <FieldError message={errors.make?.message} />
            </div>
            <div>
              <Label required>Model</Label>
              <input {...register('model')} placeholder="e.g. Camry" className={inputCls} />
              <FieldError message={errors.model?.message} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label required>Year</Label>
              <input
                type="number"
                {...register('year', { valueAsNumber: true })}
                placeholder="2023"
                className={inputCls}
              />
              <FieldError message={errors.year?.message} />
            </div>
            <div>
              <Label required>Seats</Label>
              <input
                type="number"
                {...register('seatingCapacity', { valueAsNumber: true })}
                placeholder="5"
                className={inputCls}
              />
              <FieldError message={errors.seatingCapacity?.message} />
            </div>
            <div>
              <Label>Engine</Label>
              <input {...register('engineType')} placeholder="2.5L 4-Cyl" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Transmission</Label>
              <select {...register('transmission')} className={inputCls}>
                {TRANSMISSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label required>Fuel type</Label>
              <select {...register('fuelType')} className={inputCls}>
                {FUEL_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-800">Pricing</p>
          <p className="text-xs text-slate-500">
            Daily is required. Set any of the others to let renters pick that duration too —
            leave a field blank if you don&apos;t want to offer it.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>6-hour price ({currency})</Label>
              <input
                type="number"
                step="0.01"
                {...register('pricePer6Hours', { valueAsNumber: true })}
                placeholder="120"
                className={inputCls}
              />
              <FieldError message={errors.pricePer6Hours?.message} />
            </div>
            <div>
              <Label>12-hour price ({currency})</Label>
              <input
                type="number"
                step="0.01"
                {...register('pricePer12Hours', { valueAsNumber: true })}
                placeholder="200"
                className={inputCls}
              />
              <FieldError message={errors.pricePer12Hours?.message} />
            </div>
            <div>
              <Label required>Daily price ({currency})</Label>
              <input
                type="number"
                step="0.01"
                {...register('pricePerDay', { valueAsNumber: true })}
                placeholder="350"
                className={inputCls}
              />
              <FieldError message={errors.pricePerDay?.message} />
            </div>
            <div>
              <Label>Weekly price ({currency})</Label>
              <input
                type="number"
                step="0.01"
                {...register('pricePerWeek', { valueAsNumber: true })}
                placeholder="2100"
                className={inputCls}
              />
              <FieldError message={errors.pricePerWeek?.message} />
            </div>
            <div>
              <Label>Monthly price ({currency})</Label>
              <input
                type="number"
                step="0.01"
                {...register('pricePerMonth', { valueAsNumber: true })}
                placeholder="7500"
                className={inputCls}
              />
              <FieldError message={errors.pricePerMonth?.message} />
            </div>
          </div>

          <div>
            <Label>Pricing notes</Label>
            <input
              {...register('pricingNotes')}
              placeholder="e.g. Includes insurance, min 3 days"
              className={inputCls}
            />
          </div>
        </section>

        {/* Location & Details */}
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-800">Location & details</p>

          {showroom ? (
            <div>
              <Label>Location</Label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <p className="text-sm font-medium text-slate-800">{showroom.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {showroom.address}, {showroom.area ? `${showroom.area}, ` : ''}
                  {showroom.city.charAt(0).toUpperCase() + showroom.city.slice(1)}
                </p>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                This vehicle will be listed at your showroom address.
              </p>
            </div>
          ) : (
            <p className="text-xs text-amber-600">
              No showroom on file — add one in your profile so this vehicle has a listed location.
            </p>
          )}

          <div>
            <Label>Availability notes</Label>
            <textarea
              {...register('availabilityNotes')}
              rows={2}
              placeholder="e.g. Available weekdays only, min 2-day rental"
              className={cn(inputCls, 'resize-none')}
            />
          </div>

          <div>
            <Label>Special conditions</Label>
            <textarea
              {...register('specialConditions')}
              rows={2}
              placeholder="e.g. Driver must be 25+, security deposit required"
              className={cn(inputCls, 'resize-none')}
            />
          </div>
        </section>

        {/* Features */}
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-800">Features & amenities</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_FEATURES.map((feature) => {
              const selected = selectedFeatures.includes(feature);
              return (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-primary hover:text-primary',
                  )}
                >
                  {feature}
                </button>
              );
            })}
          </div>
          {selectedFeatures.length > 0 && (
            <p className="text-xs text-slate-400">
              {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/provider/vehicles')}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? 'Creating…' : 'Save as draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
