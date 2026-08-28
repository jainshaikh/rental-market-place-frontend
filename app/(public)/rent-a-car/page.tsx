import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { fetchListings, fetchDistinctMakes, fetchDistinctCities } from '../../../lib/api/server';
import { VehiclesView } from '../../../components/listings/VehiclesView';
import type { ListingsResponse } from '../../../lib/api/listings.api';

export const metadata: Metadata = {
  title: 'Rent a Car — Browse Vehicles Near You',
  description:
    'Find a car for rent in Karachi, Lahore, Islamabad, and other cities in Pakistan. Compare verified providers by make, price, and location — book in minutes.',
  keywords: ['cars for rent', 'car rental search', 'rent a car near me', 'vehicle hire Pakistan'],
  alternates: {
    canonical: '/rent-a-car',
  },
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function RentACarPage({ searchParams }: PageProps) {
  // Same geolocation cookie HeroSearch sets — only used as an initial
  // default (both for this SSR fetch and, client-side, as VehiclesView's
  // `defaultCity` prop) when the visitor hasn't already picked a city here.
  const preferredCity = cookies().get('preferredCity')?.value;
  const effectiveSearchParams = searchParams.city ? searchParams : { ...searchParams, city: preferredCity };

  // Parallel server-side data fetch
  const [listingsRes, makesRes, citiesRes] = await Promise.all([
    fetchListings(effectiveSearchParams),
    fetchDistinctMakes(),
    fetchDistinctCities(),
  ]);

  const initialData: ListingsResponse | null = listingsRes
    ? { data: listingsRes.data, meta: listingsRes.meta as ListingsResponse['meta'] }
    : null;

  const makes = makesRes?.data ?? [];
  const cities = citiesRes?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-[26px] font-bold tracking-tight text-ink">Rent a Car</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          {initialData?.meta.total
            ? `${initialData.meta.total.toLocaleString()} vehicles available from verified providers`
            : 'Find the perfect vehicle for your needs'}
        </p>
      </div>

      {/* Listings with filters — Suspense boundary for streaming */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        }
      >
        <VehiclesView
          initialData={initialData}
          makes={makes}
          cities={cities}
          defaultCity={preferredCity}
        />
      </Suspense>
    </div>
  );
}
