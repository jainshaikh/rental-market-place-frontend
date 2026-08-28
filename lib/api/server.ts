/**
 * Server-side fetch utility for Next.js Server Components.
 * Uses native fetch() with Next.js cache semantics — not Axios.
 * Only import this from Server Components (no 'use client').
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

interface FetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

async function serverFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T | null> {
  const { revalidate = 60, tags } = options;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: {
        revalidate: revalidate === false ? undefined : revalidate,
        tags,
      },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json as T;
  } catch {
    return null;
  }
}

export interface ServerListingsResponse {
  success: boolean;
  data: import('../api/listings.api').ListingVehicleCard[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ServerVehicleDetailResponse {
  success: boolean;
  data: import('../api/listings.api').ListingVehicleDetail;
}

export async function fetchListings(searchParams: Record<string, string | string[] | undefined>) {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(searchParams)) {
    if (val) qs.set(key, Array.isArray(val) ? val[0] : val);
  }
  const path = `/listings${qs.size ? `?${qs}` : ''}`;
  return serverFetch<ServerListingsResponse>(path, { revalidate: 60 });
}

export async function fetchVehicleBySlug(slug: string) {
  // No cache for detail pages — each SSR render increments viewCount
  return serverFetch<ServerVehicleDetailResponse>(`/listings/${slug}`, { revalidate: false });
}

export async function fetchFeaturedListings(limit = 8, city?: string) {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (city) qs.set('city', city);
  return serverFetch<{ success: boolean; data: import('../api/listings.api').ListingVehicleCard[] }>(
    `/listings/featured?${qs}`,
    { revalidate: 300, tags: ['featured-listings'] },
  );
}

export async function fetchDistinctMakes() {
  return serverFetch<{ success: boolean; data: string[] }>('/listings/meta/makes', { revalidate: 3600 });
}

export async function fetchDistinctCities() {
  return serverFetch<{ success: boolean; data: string[] }>('/listings/meta/cities', { revalidate: 3600 });
}

export interface ServerProvidersResponse {
  success: boolean;
  data: import('./providers.api').PublicProviderCard[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ServerProviderDetailResponse {
  success: boolean;
  data: import('./providers.api').PublicProviderDetail;
}

export async function fetchAllProviders(page = 1, limit = 12, city?: string) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (city) qs.set('city', city);
  return serverFetch<ServerProvidersResponse>(`/providers?${qs}`, {
    revalidate: 120,
    tags: ['providers'],
  });
}

export async function fetchProviderBySlug(slug: string) {
  return serverFetch<ServerProviderDetailResponse>(`/providers/${slug}`, {
    revalidate: 60,
    tags: [`provider-${slug}`],
  });
}

export interface ServerTripsResponse {
  success: boolean;
  data: import('../api/trips.api').TripCard[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ServerTripDetailResponse {
  success: boolean;
  data: import('../api/trips.api').TripDetail;
}

export async function fetchTrips(searchParams: Record<string, string | string[] | undefined>) {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(searchParams)) {
    if (val) qs.set(key, Array.isArray(val) ? val[0] : val);
  }
  const path = `/trips${qs.size ? `?${qs}` : ''}`;
  // Short cache — trip availability (seats/status) is time-sensitive
  return serverFetch<ServerTripsResponse>(path, { revalidate: 30 });
}

export async function fetchTripById(id: string) {
  return serverFetch<ServerTripDetailResponse>(`/trips/${id}`, { revalidate: 30 });
}

export async function fetchTripMetaCities() {
  return serverFetch<{ success: boolean; data: import('../api/trips.api').TripMetaCities }>(
    '/trips/meta/cities',
    { revalidate: 300 },
  );
}

export async function fetchRatingSummary(
  subjectType: import('../api/reviews.api').ReviewSubjectType,
  subjectId: string,
) {
  return serverFetch<{ success: boolean; data: import('../api/reviews.api').RatingSummary }>(
    `/reviews/summary?subjectType=${subjectType}&subjectId=${subjectId}`,
    { revalidate: 300 },
  );
}
