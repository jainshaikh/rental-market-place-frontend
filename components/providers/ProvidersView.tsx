'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { providersApi, type ProvidersListResponse } from '../../lib/api/providers.api';
import { ProviderCard } from './ProviderCard';
import { Pagination, Select } from '../ui';

interface ProvidersViewProps {
  initialData: ProvidersListResponse | null;
  cities: string[];
  /** Geolocation-detected city (see HeroSearch) — applied once, client-side,
   * only when the URL doesn't already specify a city. A `useRef` guard keeps
   * it from reapplying if the visitor then explicitly clears the filter
   * within the same page visit. */
  defaultCity?: string;
}

export function ProvidersView({ initialData, cities, defaultCity }: ProvidersViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appliedDefault = useRef(false);

  const city = searchParams.get('city') || undefined;
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const updateParam = (key: string, value: string | number | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    if (key !== 'page') params.set('page', '1');
    router.push(`${pathname}${params.size ? `?${params}` : ''}`, { scroll: false });
  };

  useEffect(() => {
    if (appliedDefault.current) return;
    appliedDefault.current = true;
    if (defaultCity && !searchParams.get('city')) {
      updateParam('city', defaultCity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ['providers', city, page],
    queryFn: () => providersApi.getAllPublic(page, 12, city),
    initialData: initialData ?? undefined,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const providers = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div>
      {cities.length > 0 && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="w-full max-w-[220px]">
            <Select label="City" value={city ?? ''} onChange={(e) => updateParam('city', e.target.value || undefined)}>
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </Select>
          </div>
          {city && (
            <button
              onClick={() => updateParam('city', undefined)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear city filter
            </button>
          )}
        </div>
      )}

      {providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700">
            {city ? `No providers in ${city.charAt(0).toUpperCase() + city.slice(1)} yet` : 'No providers yet'}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {city ? (
              <button onClick={() => updateParam('city', undefined)} className="hover:underline">
                Browse all cities
              </button>
            ) : (
              'Check back soon'
            )}
          </p>
        </div>
      ) : (
        <div className={isFetching ? 'pointer-events-none opacity-70 transition-opacity' : undefined}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <Pagination page={page} totalPages={meta.totalPages} onPageChange={(p) => updateParam('page', p)} className="mt-10" />
          )}
        </div>
      )}
    </div>
  );
}
