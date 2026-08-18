'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Car } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import type { TripCard as TripCardType } from '../../lib/api/trips.api';
import { WhatsAppButton } from '../ui';

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function seatsPillClass(seats: number): string {
  if (seats <= 0) return 'bg-status-slate-bg text-status-slate-fg border-status-slate-border';
  if (seats === 1) return 'bg-status-amber-bg text-status-amber-fg border-status-amber-border';
  return 'bg-status-emerald-bg text-status-emerald-fg border-status-emerald-border';
}

interface TripCardProps {
  trip: TripCardType;
  className?: string;
}

export function TripCard({ trip, className }: TripCardProps) {
  const price = Number(trip.pricePerSeat).toLocaleString();
  const departure = new Date(trip.departureAt);
  const poster = trip.userVehicle.images[0];
  const whatsappMessage = `Hi, I'm interested in your trip from ${titleCase(trip.originCity)} to ${titleCase(
    trip.destinationCity,
  )} on ${departure.toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}. Is a seat still available?`;

  return (
    <Link
      href={`/trips/${trip.id}`}
      className={cn(
        'group block overflow-hidden rounded-card border border-border-subtle bg-surface shadow-xs transition-shadow duration-200 hover:shadow-sm',
        className,
      )}
    >
      {/* Vehicle photo */}
      {poster && (
        <div className="relative aspect-video w-full bg-surface-hover">
          <Image
            src={poster.url}
            alt={poster.altText ?? `${trip.userVehicle.make} ${trip.userVehicle.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}

      {/* Header strip */}
      <div className="relative border-b border-border-subtle/70 bg-page p-3.5">
        <div className="flex items-center gap-1.5 pr-20 text-[15px] font-semibold leading-tight tracking-tight text-ink">
          <span className="truncate">{titleCase(trip.originCity)}</span>
          <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-brand-600" />
          <span className="truncate transition-colors group-hover:text-brand-600">{titleCase(trip.destinationCity)}</span>
        </div>
        <p className="mt-1 font-mono text-xs text-text-muted">
          {departure.toLocaleDateString('en-AE', { weekday: 'short', day: 'numeric', month: 'short' })}
          {' · '}
          {departure.toLocaleTimeString('en-AE', { hour: 'numeric', minute: '2-digit' })}
        </p>

        <div
          className={cn(
            'absolute right-3.5 top-3.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
            seatsPillClass(trip.availableSeats),
          )}
        >
          {trip.availableSeats > 0 ? `${trip.availableSeats} seat${trip.availableSeats !== 1 ? 's' : ''} left` : 'Full'}
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 pb-4">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-lg font-semibold text-ink">PKR {price}</span>
          <span className="text-xs text-text-faint">/seat</span>
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
          <Car className="h-3.5 w-3.5 text-text-faint" />
          {trip.userVehicle.make} {trip.userVehicle.model}
          {trip.userVehicle.color ? ` · ${trip.userVehicle.color}` : ''}
        </p>

        {/* Poster + WhatsApp */}
        <div className="mt-3 flex items-center justify-between border-t border-border-subtle/70 pt-3">
          <span className="truncate text-xs text-text-muted">{trip.postedBy.name}</span>
          <span onClick={(e) => e.stopPropagation()}>
            <WhatsAppButton phone={trip.contactNumber} message={whatsappMessage} variant="text" className="ml-2" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader matching TripCard layout
export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-border-subtle bg-surface">
      <div className="h-16 animate-shimmer bg-[linear-gradient(90deg,#F1F5F9_0px,#E8EDF3_120px,#F1F5F9_240px)] bg-[length:480px_100%]" />
      <div className="space-y-3 p-3.5 pb-4">
        <div className="h-3.5 w-3/4 rounded-chip bg-surface-hover" />
        <div className="h-3 w-1/2 rounded-chip bg-surface-hover" />
        <div className="flex justify-between border-t border-border-subtle/70 pt-3">
          <div className="h-3 w-1/3 rounded-chip bg-surface-hover" />
          <div className="h-3 w-1/4 rounded-chip bg-surface-hover" />
        </div>
      </div>
    </div>
  );
}
