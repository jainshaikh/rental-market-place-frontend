import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rentalmarket.ae';
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

async function fetchJson<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchVehicleSlugs(): Promise<string[]> {
  const data = await fetchJson<{ data: { slug: string }[] }>(
    '/listings?limit=500&sort=newest',
    3600,
  );
  return (data?.data ?? []).map((v) => v.slug);
}

async function fetchProviderSlugs(): Promise<string[]> {
  const data = await fetchJson<{ data: { slug: string }[] }>('/providers?limit=500', 3600);
  return (data?.data ?? []).map((p) => p.slug);
}

async function fetchCities(): Promise<string[]> {
  const data = await fetchJson<{ data: string[] }>('/listings/meta/cities', 3600);
  return data?.data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicleSlugs, providerSlugs, cities] = await Promise.all([
    fetchVehicleSlugs(),
    fetchProviderSlugs(),
    fetchCities(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/vehicles`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/providers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/trips`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ];

  // City landing pages — the main long-tail SEO target ("car for rent in
  // Karachi" etc.). Individual /trips/[id] pages are deliberately excluded:
  // trips are short-lived (a specific date/route) and churn too fast for a
  // sitemap entry to stay meaningful, unlike vehicles/providers which persist.
  const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/car-rental/${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const vehicleRoutes: MetadataRoute.Sitemap = vehicleSlugs.map((slug) => ({
    url: `${BASE_URL}/vehicles/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const providerRoutes: MetadataRoute.Sitemap = providerSlugs.map((slug) => ({
    url: `${BASE_URL}/providers/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...cityRoutes, ...vehicleRoutes, ...providerRoutes];
}
