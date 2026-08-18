'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VehicleCard, VehicleCardSkeleton } from '../listings/VehicleCard';
import { listingsApi, type ListingFilters } from '../../lib/api/listings.api';
import { cn } from '../../lib/utils/cn';

const TRANSMISSION_OPTS = [
  { value: '', label: 'Any' },
  { value: 'AUTOMATIC', label: 'Automatic' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'CVT', label: 'CVT' },
];

const FUEL_OPTS = [
  { value: '', label: 'Any' },
  { value: 'PETROL', label: 'Petrol' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const SORT_OPTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most popular' },
];

interface Props {
  providerSlug: string;
  providerName: string;
}

export function ProviderVehiclesSection({ providerSlug, providerName }: Props) {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [make, setMake] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [sort, setSort] = useState<ListingFilters['sort']>('newest');
  const [page, setPage] = useState(1);

  const filters: ListingFilters = {
    providerSlug,
    sort,
    page,
    limit: 12,
    ...(search && { search }),
    ...(make && { make }),
    ...(fuelType && { fuelType }),
    ...(transmission && { transmission }),
  };

  const { data, isFetching } = useQuery({
    queryKey: ['listings', 'provider', providerSlug, filters],
    queryFn: () => listingsApi.getAll(filters),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const vehicles = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const hasActiveFilters = !!(search || make || fuelType || transmission);

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setMake('');
    setFuelType('');
    setTransmission('');
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5';
  const inputCls = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50';

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          {isFetching ? 'Loading…' : meta ? `${meta.total} listing${meta.total !== 1 ? 's' : ''}` : `Listings by ${providerName}`}
        </h2>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex gap-1.5">
            <input
              type="text"
              placeholder="Search vehicles…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Go
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </form>

          <select
            value={sort ?? 'newest'}
            onChange={(e) => { setSort(e.target.value as ListingFilters['sort']); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {SORT_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <aside className="hidden w-52 flex-shrink-0 space-y-5 lg:block">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Filters</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                Clear all
              </button>
            )}
          </div>

          <div>
            <label className={labelCls}>Make</label>
            <input
              type="text"
              placeholder="e.g. Toyota"
              value={make}
              onChange={(e) => { setMake(e.target.value); setPage(1); }}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Transmission</label>
            <div className="flex flex-wrap gap-1.5">
              {TRANSMISSION_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setTransmission(opt.value); setPage(1); }}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs transition-colors',
                    transmission === opt.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-primary',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Fuel type</label>
            <div className="flex flex-wrap gap-1.5">
              {FUEL_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setFuelType(opt.value); setPage(1); }}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs transition-colors',
                    fuelType === opt.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-primary',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Vehicle grid */}
        <div className="min-w-0 flex-1">
          {isFetching && vehicles.length === 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
              <svg className="mx-auto mb-3 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="font-medium text-slate-600">No vehicles found</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-3 text-sm text-primary hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={cn(
                'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3',
                isFetching && 'pointer-events-none opacity-70 transition-opacity',
              )}>
                {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
