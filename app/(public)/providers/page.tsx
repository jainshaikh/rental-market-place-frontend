import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { fetchAllProviders, fetchDistinctCities } from '../../../lib/api/server';
import { ProvidersView } from '../../../components/providers/ProvidersView';
import type { ProvidersListResponse } from '../../../lib/api/providers.api';

export const metadata: Metadata = {
  title: 'Verified Car Rental Providers in Pakistan',
  description:
    'Browse verified vehicle rental providers across Karachi, Lahore, Islamabad, and other cities in Pakistan. Every provider is reviewed before listing.',
  keywords: ['car rental companies Pakistan', 'verified car rental providers', 'vehicle hire providers'],
  alternates: {
    canonical: '/providers',
  },
};

interface PageProps {
  searchParams: { page?: string; city?: string };
}

export default async function ProvidersPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const city = searchParams.city;
  // Same geolocation cookie HeroSearch sets — only used as an initial
  // default when the visitor hasn't already picked a city on this page.
  const preferredCity = cookies().get('preferredCity')?.value;

  const [providersRes, citiesRes] = await Promise.all([
    fetchAllProviders(page, 12, city ?? preferredCity),
    fetchDistinctCities(),
  ]);

  const initialData: ProvidersListResponse | null = providersRes
    ? { data: providersRes.data, meta: providersRes.meta as ProvidersListResponse['meta'] }
    : null;
  const cities = citiesRes?.data ?? [];
  const effectiveCity = city ?? preferredCity;
  const cityLabel = effectiveCity ? effectiveCity.charAt(0).toUpperCase() + effectiveCity.slice(1) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {cityLabel ? `Rental Providers in ${cityLabel}` : 'Rental Providers'}
        </h1>
        <p className="mt-2 text-slate-500">
          {initialData?.meta
            ? `${initialData.meta.total} verified provider${initialData.meta.total !== 1 ? 's' : ''} ${cityLabel ? `in ${cityLabel}` : 'across Pakistan'}`
            : 'Browse verified rental providers'}
        </p>
      </div>

      <ProvidersView initialData={initialData} cities={cities} defaultCity={preferredCity} />
    </div>
  );
}
