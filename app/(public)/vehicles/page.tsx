import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchListings, fetchDistinctMakes, fetchDistinctCities } from '../../../lib/api/server';
import { VehiclesView } from '../../../components/listings/VehiclesView';
import type { ListingsResponse } from '../../../lib/api/listings.api';

export const metadata: Metadata = {
  title: 'Browse Vehicles — Rental Marketplace',
  description: 'Find and rent vehicles from verified providers. Search by make, location, price, and more.',
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function VehiclesPage({ searchParams }: PageProps) {
  // Parallel server-side data fetch
  const [listingsRes, makesRes, citiesRes] = await Promise.all([
    fetchListings(searchParams),
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
        <h1 className="text-[26px] font-bold tracking-tight text-ink">Browse Vehicles</h1>
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
        />
      </Suspense>
    </div>
  );
}
