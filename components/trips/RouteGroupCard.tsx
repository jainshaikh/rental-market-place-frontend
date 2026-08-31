'use client';

import Link from 'next/link';
import { ArrowRight, Users, Clock } from 'lucide-react';
import type { TripRouteGroup } from '../../lib/api/trips.api';
import { getCurrencyCode } from '../../lib/utils/currency';

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatNextDeparture(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  return date.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' }) + `, ${time}`;
}

// A route-level summary card — deliberately carries no single trip's own
// price/seats/vehicle, since a route can have many trips from different
// drivers. Clicking through to /carpool/{route} is where an individual trip
// gets chosen, with full filters to compare them.
export function RouteGroupCard({ route }: { route: TripRouteGroup }) {
  const currency = getCurrencyCode();
  const nextDeparture = formatNextDeparture(route.nextDepartureAt);

  return (
    <Link
      href={`/carpool/${route.originCity.toLowerCase()}-to-${route.destinationCity.toLowerCase()}`}
      className="group block overflow-hidden rounded-card border border-border-subtle bg-surface p-4 shadow-xs transition-all duration-200 ease-spring hover:-translate-y-1 hover:border-brand-100 hover:shadow-md"
    >
      <div className="flex items-center gap-2 text-base font-semibold tracking-tight text-ink">
        <span className="truncate">{titleCase(route.originCity)}</span>
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-brand-600 transition-transform duration-200 group-hover:translate-x-1" />
        <span className="truncate transition-colors group-hover:text-brand-700">
          {titleCase(route.destinationCity)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
        <Users className="h-3.5 w-3.5 flex-shrink-0" />
        {route.tripCount} trip{route.tripCount !== 1 ? 's' : ''} available
      </div>

      {nextDeparture && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          Next departure {nextDeparture}
        </div>
      )}

      {route.minPricePerSeat != null && (
        <div className="mt-3 border-t border-border-subtle pt-3">
          <span className="text-xs text-text-faint">from </span>
          <span className="font-mono text-sm font-semibold text-ink">
            {currency} {Number(route.minPricePerSeat).toLocaleString()}
          </span>
          <span className="text-xs text-text-faint">/seat</span>
        </div>
      )}
    </Link>
  );
}
