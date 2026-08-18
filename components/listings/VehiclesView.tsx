'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { VehicleCard, VehicleCardSkeleton } from './VehicleCard';
import {
  listingsApi,
  type ListingFilters,
  type ListingsResponse,
} from '../../lib/api/listings.api';
import { cn } from '../../lib/utils/cn';
import { Button, Card, EmptyState, Input, Pagination, PillToggle, Select } from '../ui';

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

interface VehiclesViewProps {
  initialData: ListingsResponse | null;
  makes: string[];
  cities: string[];
}

function parseSearchParams(searchParams: URLSearchParams): ListingFilters {
  return {
    search: searchParams.get('search') || undefined,
    make: searchParams.get('make') || undefined,
    fuelType: searchParams.get('fuelType') || undefined,
    transmission: searchParams.get('transmission') || undefined,
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
    city: searchParams.get('city') || undefined,
    seats: searchParams.get('seats') ? Number(searchParams.get('seats')) : undefined,
    sort: (searchParams.get('sort') as ListingFilters['sort']) || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };
}

export function VehiclesView({ initialData, makes, cities }: VehiclesViewProps) {
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
      // Reset to page 1 when filter changes (unless it's a page change)
      if (key !== 'page') params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const { data, isFetching } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingsApi.getAll(filters),
    initialData: initialData ?? undefined,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const vehicles = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;

  const hasActiveFilters = !!(
    filters.search ||
    filters.make ||
    filters.fuelType ||
    filters.transmission ||
    filters.city ||
    filters.priceMin ||
    filters.priceMax ||
    filters.seats
  );

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
      {/* Filter sidebar — desktop */}
      <aside className="hidden w-[236px] flex-shrink-0 lg:block">
        <FilterPanel
          filters={filters}
          makes={makes}
          cities={cities}
          onUpdate={updateFilter}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        />
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Toolbar */}
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
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
              {isFetching ? (
                'Loading…'
              ) : meta ? (
                <>
                  {meta.total.toLocaleString()} vehicle{meta.total !== 1 ? 's' : ''}
                </>
              ) : (
                ''
              )}
            </p>
          </div>

          {/* Sort */}
          <Select
            value={filters.sort ?? 'newest'}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="w-auto"
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
          <Card className="mb-3.5 lg:hidden">
            <FilterPanel
              filters={filters}
              makes={makes}
              cities={cities}
              onUpdate={updateFilter}
              hasActiveFilters={hasActiveFilters}
              onClear={clearFilters}
            />
          </Card>
        )}

        {/* Grid */}
        {isFetching && vehicles.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Nothing matches those filters"
            description="Try widening the price range or removing a filter."
            action={hasActiveFilters ? { label: 'Clear all filters', onClick: clearFilters, variant: 'secondary' } : undefined}
          />
        ) : (
          <>
            <div
              className={cn(
                'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3',
                isFetching && 'pointer-events-none opacity-70 transition-opacity',
              )}
            >
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => updateFilter('page', p)}
              className="mt-7"
            />
          </>
        )}
      </div>
    </div>
  );
}

interface FilterPanelProps {
  filters: ListingFilters;
  makes: string[];
  cities: string[];
  onUpdate: (key: string, value: string | number | undefined) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

function FilterPanel({ filters, makes, cities, onUpdate, hasActiveFilters, onClear }: FilterPanelProps) {
  const groupLabelCls = 'mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted';

  return (
    <Card className="space-y-[18px]">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">Filters</p>
        {hasActiveFilters && (
          <button onClick={onClear} className="text-xs font-semibold text-brand-600 hover:underline">
            Reset
          </button>
        )}
      </div>

      <Input
        label="Search"
        placeholder="Make, model, or keyword"
        value={filters.search ?? ''}
        onChange={(e) => onUpdate('search', e.target.value || undefined)}
      />

      <Select label="Make" value={filters.make ?? ''} onChange={(e) => onUpdate('make', e.target.value || undefined)}>
        <option value="">All makes</option>
        {makes.map((m) => (
          <option key={m} value={m}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </option>
        ))}
      </Select>

      {cities.length > 0 && (
        <Select label="City" value={filters.city ?? ''} onChange={(e) => onUpdate('city', e.target.value || undefined)}>
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </Select>
      )}

      <div>
        <div className={groupLabelCls}>Price per day (PKR)</div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin ?? ''}
            onChange={(e) => onUpdate('priceMin', e.target.value ? Number(e.target.value) : undefined)}
            className="w-1/2 rounded-control border border-border-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/18"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax ?? ''}
            onChange={(e) => onUpdate('priceMax', e.target.value ? Number(e.target.value) : undefined)}
            className="w-1/2 rounded-control border border-border-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/18"
          />
        </div>
      </div>

      <div>
        <div className={groupLabelCls}>Transmission</div>
        <div className="flex flex-wrap gap-1.5">
          {TRANSMISSION_OPTS.map((opt) => (
            <PillToggle
              key={opt.value}
              active={(filters.transmission ?? '') === opt.value}
              onClick={() => onUpdate('transmission', opt.value || undefined)}
            >
              {opt.label}
            </PillToggle>
          ))}
        </div>
      </div>

      <div>
        <div className={groupLabelCls}>Fuel type</div>
        <div className="flex flex-wrap gap-1.5">
          {FUEL_OPTS.map((opt) => (
            <PillToggle
              key={opt.value}
              active={(filters.fuelType ?? '') === opt.value}
              onClick={() => onUpdate('fuelType', opt.value || undefined)}
            >
              {opt.label}
            </PillToggle>
          ))}
        </div>
      </div>

      <Select
        label="Min seats"
        value={filters.seats ?? ''}
        onChange={(e) => onUpdate('seats', e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">Any</option>
        {[2, 4, 5, 7, 8, 9, 12].map((n) => (
          <option key={n} value={n}>
            {n}+
          </option>
        ))}
      </Select>
    </Card>
  );
}
