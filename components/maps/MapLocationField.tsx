'use client';

import { useId } from 'react';
import { cn } from '../../lib/utils/cn';
import { MapLocationPicker } from './MapLocationPicker';

interface MapLocationFieldProps {
  label?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  addressValue: string;
  onAddressChange: (text: string) => void;
  lat?: number;
  lng?: number;
  onLocationChange: (lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
}

// Matches components/ui/Input's label/error/helper layout — a drop-in
// look-alike for react-hook-form fields that need a map + address picker
// instead of a plain text input, e.g. TripForm's pickup/dropoff.
export function MapLocationField({
  label,
  required,
  helper,
  error,
  addressValue,
  onAddressChange,
  lat,
  lng,
  onLocationChange,
  placeholder,
  className,
}: MapLocationFieldProps) {
  const fieldId = useId();

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={fieldId} className="mb-2 block text-[13px] font-semibold text-slate-700">
          {label}
          {required ? <span className="ml-0.5 text-red-600">*</span> : null}
        </label>
      ) : null}
      <MapLocationPicker
        inputId={fieldId}
        addressValue={addressValue}
        onAddressChange={onAddressChange}
        lat={lat}
        lng={lng}
        onLocationChange={onLocationChange}
        placeholder={placeholder}
        inputClassName={cn(
          'w-full rounded-control border bg-surface px-3.5 py-[11px] text-[15px] text-ink placeholder:text-text-faint outline-none transition-shadow',
          'focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/18',
          error ? 'border-red-600' : 'border-border-strong',
        )}
      />
      {error ? (
        <p className="mt-[7px] flex items-center gap-1.5 text-[13px] text-red-700">{error}</p>
      ) : helper ? (
        <p className="mt-[7px] text-[13px] text-text-faint">{helper}</p>
      ) : null}
    </div>
  );
}
