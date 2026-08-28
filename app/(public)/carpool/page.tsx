import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { fetchTrips, fetchTripMetaCities } from '../../../lib/api/server';
import { TripsView } from '../../../components/trips/TripsView';
import type { TripsResponse, TripMetaCities, TripCard as TripCardType } from '../../../lib/api/trips.api';

function toDisplayName(value: string): string {
  return value
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const metadata: Metadata = {
  title: 'Carpool — Share a Ride Between Cities',
  description:
    'Carpool and share a ride between cities in Pakistan. Browse drivers heading to your destination on your date and contact them directly on WhatsApp — no fees, no middleman.',
  keywords: [
    'carpool Pakistan',
    'share a ride',
    'share your ride',
    'intercity carpool',
    'ride sharing Pakistan',
    'find a ride between cities',
  ],
  alternates: {
    canonical: '/carpool',
  },
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CarpoolPage({ searchParams }: PageProps) {
  const [tripsRes, citiesRes, sampleRes] = await Promise.all([
    fetchTrips(searchParams),
    fetchTripMetaCities(),
    // Unfiltered sample, independent of the page's own searchParams-driven
    // fetch above — used only to surface real, currently-live routes/cities
    // as internal links to their permanent /carpool/[route] pages.
    fetchTrips({ limit: '30', sort: 'newest' }),
  ]);

  const initialData: TripsResponse | null = tripsRes
    ? { data: tripsRes.data, meta: tripsRes.meta as TripsResponse['meta'] }
    : null;

  const cities: TripMetaCities = citiesRes?.data ?? { origins: [], destinations: [] };

  const sample = (sampleRes?.data ?? []) as TripCardType[];

  const popularRoutes = Array.from(
    new Map(
      sample.map((t) => [
        `${t.originCity.toLowerCase()}-to-${t.destinationCity.toLowerCase()}`,
        { origin: t.originCity.toLowerCase(), destination: t.destinationCity.toLowerCase() },
      ]),
    ).values(),
  ).slice(0, 8);

  const popularCities = Array.from(new Set(sample.map((t) => t.originCity.toLowerCase()))).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
          Ride sharing
        </p>
        <h1 className="text-[30px] font-bold tracking-[-0.04em] text-ink">Carpool</h1>
        <p className="mt-2 text-sm text-text-muted">
          {initialData?.meta.total
            ? `${initialData.meta.total.toLocaleString()} upcoming trips — find a ride and connect with the driver on WhatsApp`
            : 'Going from one city to another? Find a driver already headed your way.'}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Share a ride between cities — connect directly, no fees.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        }
      >
        <TripsView initialData={initialData} cities={cities} />
      </Suspense>

      {popularCities.length > 0 && (
        <div className="mt-14 border-t border-border-subtle pt-8">
          <h2 className="text-sm font-semibold text-ink">Browse by city</h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {popularCities.map((city) => (
              <Link
                key={city}
                href={`/carpool/${city}`}
                className="inline-flex h-9 items-center rounded-control border border-border-subtle bg-page px-3.5 text-sm font-medium text-ink transition-colors hover:border-brand-600 hover:text-brand-700"
              >
                {toDisplayName(city)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {popularRoutes.length > 0 && (
        <div className="mt-10 border-t border-border-subtle pt-8">
          <h2 className="text-sm font-semibold text-ink">Popular routes</h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {popularRoutes.map(({ origin, destination }) => (
              <Link
                key={`${origin}-to-${destination}`}
                href={`/carpool/${origin}-to-${destination}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-control border border-border-subtle bg-page px-3.5 text-sm font-medium text-ink transition-colors hover:border-brand-600 hover:text-brand-700"
              >
                {toDisplayName(origin)}
                <ArrowRight className="h-3 w-3" />
                {toDisplayName(destination)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
