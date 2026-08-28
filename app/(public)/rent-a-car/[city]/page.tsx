import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';
import { fetchListings, fetchDistinctCities } from '../../../../lib/api/server';
import { VehicleCard } from '../../../../components/listings/VehicleCard';
import type { ListingVehicleCard } from '../../../../lib/api/listings.api';

interface PageProps {
  params: { city: string };
}

function toDisplayName(city: string): string {
  return city
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateStaticParams() {
  const res = await fetchDistinctCities();
  return (res?.data ?? []).map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = decodeURIComponent(params.city).toLowerCase();
  const displayName = toDisplayName(city);

  return {
    title: `Rent a Car in ${displayName} — Compare Cars & Prices`,
    description: `Find a car for rent in ${displayName} from verified providers. Compare daily and weekly rates, message the owner directly, and book with no hidden fees.`,
    keywords: [
      `rent a car in ${city}`,
      `rent a car ${displayName}`,
      `car rental ${displayName}`,
      `car for rent in ${city}`,
      `vehicle hire ${displayName}`,
    ],
    alternates: {
      canonical: `/rent-a-car/${encodeURIComponent(city)}`,
    },
    openGraph: {
      title: `Rent a Car in ${displayName}`,
      description: `Compare cars for rent in ${displayName} from verified local providers.`,
    },
  };
}

export default async function CityCarRentalPage({ params }: PageProps) {
  const city = decodeURIComponent(params.city).toLowerCase();
  const displayName = toDisplayName(city);

  const [listingsRes, citiesRes] = await Promise.all([
    fetchListings({ city, limit: '24' }),
    fetchDistinctCities(),
  ]);

  const vehicles: ListingVehicleCard[] = listingsRes?.data ?? [];
  const total = listingsRes?.meta?.total ?? 0;
  const otherCities = (citiesRes?.data ?? []).filter((c) => c.toLowerCase() !== city).slice(0, 8);

  // Derived from the same fetched batch, not a separate endpoint — a real
  // (if partial) reflection of what's actually in this city, not a fabricated
  // list. Links to /rent-a-car/[city]/[make(-model)], which does its own
  // fresh fetch.
  const popularMakes = Array.from(new Set(vehicles.map((v) => v.make.toLowerCase()))).slice(0, 8);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Rent a Car', item: '/rent-a-car' },
      { '@type': 'ListItem', position: 3, name: displayName, item: `/rent-a-car/${encodeURIComponent(city)}` },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-xs text-text-muted">
        <Link href="/" className="hover:text-slate-700">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-border-strong" />
        <Link href="/rent-a-car" className="hover:text-slate-700">
          Rent a Car
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-border-strong" />
        <span className="font-semibold text-ink">{displayName}</span>
      </nav>

      {/* Header */}
      <div className="mb-7">
        <div className="mb-2 flex items-center gap-1.5 text-sm text-brand-700">
          <MapPin className="h-4 w-4" />
          {displayName}, Pakistan
        </div>
        <h1 className="text-[26px] font-bold tracking-tight text-ink">
          Rent a Car in {displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          Looking for a car for rent in {displayName}? Browse vehicles from verified local
          providers, compare real daily and weekly rates, and send a free inquiry — no payment
          until you&rsquo;re ready to book.
          {total > 0 && ` ${total.toLocaleString()} vehicle${total === 1 ? '' : 's'} currently available.`}
        </p>
      </div>

      {vehicles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={`/rent-a-car?city=${city}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
            >
              More filters &amp; sort options for {displayName}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-600">
            No vehicles listed in {displayName} yet — check back soon, or browse other cities.
          </p>
          <Link
            href="/rent-a-car"
            className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline"
          >
            Browse all vehicles
          </Link>
        </div>
      )}

      {popularMakes.length > 0 && (
        <div className="mt-14 border-t border-border-subtle pt-8">
          <h2 className="text-sm font-semibold text-ink">Popular makes in {displayName}</h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {popularMakes.map((make) => (
              <Link
                key={make}
                href={`/rent-a-car/${encodeURIComponent(city)}/${encodeURIComponent(make)}`}
                className="inline-flex h-9 items-center rounded-control border border-border-subtle bg-page px-3.5 text-sm font-medium text-ink transition-colors hover:border-brand-600 hover:text-brand-700"
              >
                {make.charAt(0).toUpperCase() + make.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {otherCities.length > 0 && (
        <div className="mt-14 border-t border-border-subtle pt-8">
          <h2 className="text-sm font-semibold text-ink">Car rental in other cities</h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {otherCities.map((c) => (
              <Link
                key={c}
                href={`/rent-a-car/${encodeURIComponent(c)}`}
                className="inline-flex h-9 items-center rounded-control border border-border-subtle bg-page px-3.5 text-sm font-medium text-ink transition-colors hover:border-brand-600 hover:text-brand-700"
              >
                {toDisplayName(c)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
