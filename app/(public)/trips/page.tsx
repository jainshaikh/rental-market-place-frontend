import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchTrips, fetchTripMetaCities } from '../../../lib/api/server';
import { TripsView } from '../../../components/trips/TripsView';
import type { TripsResponse, TripMetaCities } from '../../../lib/api/trips.api';

export const metadata: Metadata = {
  title: 'Intercity Trips — Rental Marketplace',
  description: 'Find a ride between cities. Browse drivers heading to your destination on your date and contact them directly on WhatsApp.',
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function TripsPage({ searchParams }: PageProps) {
  const [tripsRes, citiesRes] = await Promise.all([
    fetchTrips(searchParams),
    fetchTripMetaCities(),
  ]);

  const initialData: TripsResponse | null = tripsRes
    ? { data: tripsRes.data, meta: tripsRes.meta as TripsResponse['meta'] }
    : null;

  const cities: TripMetaCities = citiesRes?.data ?? { origins: [], destinations: [] };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <h1 className="text-[26px] font-bold tracking-tight text-ink">Intercity Trips</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          {initialData?.meta.total
            ? `${initialData.meta.total.toLocaleString()} upcoming trips — find a ride and connect with the driver on WhatsApp`
            : 'Going from one city to another? Find a driver already headed your way.'}
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
    </div>
  );
}
