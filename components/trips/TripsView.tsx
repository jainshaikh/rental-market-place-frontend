'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { TripCard, TripCardSkeleton } from './TripCard';
import {
  tripsApi,
  type TripFilters,
  type TripsResponse,
  type TripMetaCities,
} from '../../lib/api/trips.api';
import { cn } from '../../lib/utils/cn';
import { Button, Card, EmptyState, Input, Pagination, Select } from '../ui';

const SORT_OPTS = [
  { value: 'departure_asc', label: 'Soonest departure' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newly posted' },
];

interface TripsViewProps {
  initialData: TripsResponse | null;
  cities: TripMetaCities;
}

function parseSearchParams(searchParams: URLSearchParams): TripFilters {
  return {
    originCity: searchParams.get('originCity') || undefined,
    destinationCity: searchParams.get('destinationCity') || undefined,
    date: searchParams.get('date') || undefined,
    minSeats: searchParams.get('minSeats') ? Number(searchParams.get('minSeats')) : undefined,
    sort: (searchParams.get('sort') as TripFilters['sort']) || 'departure_asc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };
}

export function TripsView({ initialData, cities }: TripsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const filters = parseSearchParams(searchParams);

  const updateFilter = useCallback(
    (key: string, value: string | number | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === undefined || value === '' || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      if (key !== 'page') params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const { data, isFetching } = useQuery({
    queryKey: ['trips', filters],
    queryFn: () => tripsApi.getAll(filters),
    initialData: initialData ?? undefined,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const trips = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;

  const hasActiveFilters = !!(
    filters.originCity ||
    filters.destinationCity ||
    filters.date ||
    filters.minSeats
  );

  const clearFilters = () => router.push(pathname, { scroll: false });

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
      {/* Filter sidebar — desktop. Sticky below the 68px navbar. */}
      <aside className="hidden w-[236px] flex-shrink-0 lg:block">
        <div className="sticky top-[92px]">
          <FilterPanel
            filters={filters}
            cities={cities}
            onUpdate={updateFilter}
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
            </Button>

            <p className="text-sm text-text-muted">
              {isFetching && !meta ? (
                'Loading…'
              ) : meta ? (
                <>
                  <b className="font-mono font-semibold text-ink">{meta.total.toLocaleString()}</b>{' '}
                  trip{meta.total !== 1 ? 's' : ''}
                </>
              ) : (
                ''
              )}
            </p>
          </div>

          <Select
            value={filters.sort ?? 'departure_asc'}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="w-auto"
            aria-label="Sort trips"
          >
            {SORT_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Mobile filter drawer */}
        {showFilters && (
          <Card className="mb-4 lg:hidden">
            <FilterPanel
              filters={filters}
              cities={cities}
              onUpdate={updateFilter}
              hasActiveFilters={hasActiveFilters}
              onClear={clearFilters}
            />
          </Card>
        )}

        {/* Grid */}
        {isFetching && trips.length === 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No trips found"
            description="Try a different city, date, or clear your filters."
            action={
              hasActiveFilters
                ? { label: 'Clear all filters', onClick: clearFilters, variant: 'secondary' }
                : undefined
            }
          />
        ) : (
          <>
            <div
              className={cn(
                'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3',
                isFetching && 'pointer-events-none opacity-70 transition-opacity',
              )}
            >
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => updateFilter('page', p)}
              className="mt-8"
            />
          </>
        )}
      </div>
    </div>
  );
}

interface FilterPanelProps {
  filters: TripFilters;
  cities: TripMetaCities;
  onUpdate: (key: string, value: string | number | undefined) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

function FilterPanel({ filters, cities, onUpdate, hasActiveFilters, onClear }: FilterPanelProps) {
  return (
    <Card className="space-y-[18px] bg-page">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">Filters</p>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            Reset
          </button>
        )}
      </div>

      <Select
        label="Going to"
        value={filters.destinationCity ?? ''}
        onChange={(e) => onUpdate('destinationCity', e.target.value || undefined)}
      >
        <option value="">Any city</option>
        {cities.destinations.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </option>
        ))}
      </Select>

      <Select
        label="Leaving from"
        value={filters.originCity ?? ''}
        onChange={(e) => onUpdate('originCity', e.target.value || undefined)}
      >
        <option value="">Any city</option>
        {cities.origins.map((c) => (
          <option key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </option>
        ))}
      </Select>

      <Input
        type="date"
        label="Departure date"
        value={filters.date ?? ''}
        onChange={(e) => onUpdate('date', e.target.value || undefined)}
      />

      <Select
        label="Min seats needed"
        value={filters.minSeats ?? ''}
        onChange={(e) => onUpdate('minSeats', e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">Any</option>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <option key={n} value={n}>
            {n}+
          </option>
        ))}
      </Select>
    </Card>
  );
}
