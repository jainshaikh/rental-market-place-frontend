'use client';

import Link from 'next/link';
import { Image as ImageIcon, MapPin, Users } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import type { ListingVehicleCard } from '../../lib/api/listings.api';
import { Avatar } from '../ui';

interface VehicleCardProps {
  vehicle: ListingVehicleCard;
  className?: string;
}

export function VehicleCard({ vehicle, className }: VehicleCardProps) {
  const cover = vehicle.images?.[0];
  const price = Number(vehicle.pricePerDay).toLocaleString();
  const location = vehicle.showroom?.city ?? vehicle.locationText ?? null;

  return (
    <Link
      href={`/vehicles/${vehicle.slug}`}
      className={cn(
        'group block overflow-hidden rounded-card border border-border-subtle bg-surface shadow-xs transition-shadow duration-200 hover:shadow-sm',
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-hover">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={cover.altText ?? vehicle.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-faint">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}

        {/* Price badge */}
        <div className="absolute bottom-2.5 left-2.5 rounded-control bg-ink/80 px-2.5 py-1.5 font-mono text-[13px] font-semibold text-white">
          PKR {price}
          <span className="font-sans font-normal opacity-75">/day</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-[14px] pb-[18px]">
        <h3 className="truncate text-[15px] font-semibold leading-tight tracking-tight text-ink">
          {vehicle.title}
        </h3>

        {/* Specs row */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-chip bg-surface-hover px-2.5 py-1 text-xs font-medium text-slate-600">
            {vehicle.year}
          </span>
          <span className="rounded-chip bg-surface-hover px-2.5 py-1 text-xs font-medium text-slate-600">
            {vehicle.transmission === 'AUTOMATIC'
              ? 'Automatic'
              : vehicle.transmission === 'CVT'
                ? 'CVT'
                : 'Manual'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-chip bg-surface-hover px-2.5 py-1 text-xs font-medium text-slate-600">
            <Users className="h-3 w-3" />
            {vehicle.seatingCapacity}
          </span>
        </div>

        {/* Provider + location */}
        <div className="mt-3.5 flex items-center justify-between border-t border-border-subtle/70 pt-3.5">
          <Link
            href={vehicle.providerProfile?.slug ? `/providers/${vehicle.providerProfile.slug}` : '#'}
            onClick={(e) => e.stopPropagation()}
            className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-brand-600"
          >
            <Avatar name={vehicle.providerProfile?.businessName || '?'} shape="square" size="sm" tone="ink" />
            <span className="truncate">{vehicle.providerProfile?.businessName ?? 'Unknown provider'}</span>
          </Link>
          {location && (
            <span className="ml-2 flex flex-shrink-0 items-center gap-1 text-xs text-text-muted">
              <MapPin className="h-3 w-3" />
              {location.charAt(0).toUpperCase() + location.slice(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader matching VehicleCard layout
export function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-border-subtle bg-surface">
      <div className="aspect-[16/10] animate-shimmer bg-[linear-gradient(90deg,#F1F5F9_0px,#E8EDF3_120px,#F1F5F9_240px)] bg-[length:480px_100%]" />
      <div className="space-y-3 p-[14px] pb-[18px]">
        <div className="h-3.5 w-3/4 rounded-chip bg-surface-hover" />
        <div className="h-3 w-1/2 rounded-chip bg-surface-hover" />
        <div className="flex justify-between border-t border-border-subtle/70 pt-3.5">
          <div className="h-3 w-1/3 rounded-chip bg-surface-hover" />
          <div className="h-3 w-1/4 rounded-chip bg-surface-hover" />
        </div>
      </div>
    </div>
  );
}
