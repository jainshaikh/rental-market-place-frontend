import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { fetchTrips, fetchTripMetaCities } from '../../../../lib/api/server';
import { TripsView } from '../../../../components/trips/TripsView';
import type { TripsResponse, TripMetaCities } from '../../../../lib/api/trips.api';
import { TrackEvent } from '../../../../components/common/TrackEvent';

interface PageProps {
  params: { route: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

function toDisplayName(value: string): string {
  return value
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface ParsedRoute {
  origin: string;
  destination: string | null;
}

// The URL segment is either "lahore" (origin-only — all trips departing that
// city) or "lahore-to-islamabad" (a specific route). Neither city name can
// legitimately contain "-to-", so a plain split distinguishes the two safely.
function parseRoute(route: string): ParsedRoute | null {
  const decoded = decodeURIComponent(route).toLowerCase();
  if (!decoded) return null;
  const parts = decoded.split('-to-');
  if (parts.length === 2 && parts[0] && parts[1]) return { origin: parts[0], destination: parts[1] };
  if (parts.length === 1 && parts[0]) return { origin: parts[0], destination: null };
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parsed = parseRoute(params.route);
  if (!parsed) return { title: 'Route Not Found' };
  const { origin, destination } = parsed;
  const originName = toDisplayName(origin);

  const tripsRes = await fetchTrips({
    originCity: origin,
    ...(destination ? { destinationCity: destination } : {}),
    limit: '1',
  });
  const total = tripsRes?.meta?.total ?? 0;

  // A route/city hub with no live trips right now shouldn't be indexed —
  // it's exactly the "empty combination" thin-content case the SEO reference
  // warns against (source doc §19) — but the page itself stays reachable
  // (source doc §18: route pages persist independent of any one trip).
  const robots = { index: total > 0, follow: true };

  if (destination) {
    const destinationName = toDisplayName(destination);
    return {
      title: `${originName} to ${destinationName} Carpool Rides`,
      description: `Find a carpool ride from ${originName} to ${destinationName}. Compare available seats, departure times and prices, or offer your own ride on KerayeGo.`,
      keywords: [
        `${origin} to ${destination} carpool`,
        `${originName} to ${destinationName} ride share`,
        `carpool ${originName} ${destinationName}`,
        `intercity trip ${originName} to ${destinationName}`,
      ],
      alternates: { canonical: `/carpool/${origin}-to-${destination}` },
      openGraph: {
        title: `${originName} to ${destinationName} Carpool Rides`,
        description: `Find a carpool ride from ${originName} to ${destinationName} on KerayeGo.`,
      },
      robots,
    };
  }

  return {
    title: `Carpool Rides from ${originName} — Find a Ride`,
    description: `Find a carpool ride leaving ${originName} to anywhere in Pakistan. Compare available seats, departure times and prices, or offer your own ride on KerayeGo.`,
    keywords: [
      `carpool ${origin}`,
      `${originName} carpool`,
      `ride share from ${originName}`,
      `${originName} intercity trips`,
    ],
    alternates: { canonical: `/carpool/${origin}` },
    openGraph: {
      title: `Carpool Rides from ${originName}`,
      description: `Find a carpool ride leaving ${originName} on KerayeGo.`,
    },
    robots,
  };
}

export default async function CarpoolRoutePage({ params, searchParams }: PageProps) {
  const parsed = parseRoute(params.route);
  if (!parsed) notFound();

  const { origin, destination } = parsed;
  const originName = toDisplayName(origin);
  const destinationName = destination ? toDisplayName(destination) : null;

  const effectiveSearchParams = {
    ...searchParams,
    originCity: origin,
    ...(destination ? { destinationCity: destination } : {}),
  };

  const [tripsRes, citiesRes] = await Promise.all([
    fetchTrips(effectiveSearchParams),
    fetchTripMetaCities(),
  ]);

  const initialData: TripsResponse | null = tripsRes
    ? { data: tripsRes.data, meta: tripsRes.meta as TripsResponse['meta'] }
    : null;
  const cities: TripMetaCities = citiesRes?.data ?? { origins: [], destinations: [] };
  const total = tripsRes?.meta?.total ?? 0;

  const routeSlug = destination ? `${origin}-to-${destination}` : origin;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Carpool', item: '/carpool' },
      {
        '@type': 'ListItem',
        position: 3,
        name: destinationName ? `${originName} to ${destinationName}` : originName,
        item: `/carpool/${routeSlug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {destination && <TrackEvent name="view_carpool_route" params={{ origin, destination }} />}

      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-xs text-text-muted">
        <Link href="/" className="hover:text-slate-700">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-border-strong" />
        <Link href="/carpool" className="hover:text-slate-700">
          Carpool
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-border-strong" />
        <span className="font-semibold text-ink">
          {destinationName ? `${originName} → ${destinationName}` : originName}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-7">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-brand-700">
          {originName}
          {destinationName && (
            <>
              <ArrowRight className="h-4 w-4" />
              {destinationName}
            </>
          )}
        </div>
        <h1 className="text-[26px] font-bold tracking-tight text-ink">
          {destinationName ? `${originName} to ${destinationName} Carpool Rides` : `Carpool Rides from ${originName}`}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          {destinationName
            ? `Find a ride from ${originName} to ${destinationName} and connect directly with the driver on WhatsApp — no fees, no middleman.`
            : `Find a carpool ride leaving ${originName} for anywhere in Pakistan — connect directly with the driver on WhatsApp, no fees, no middleman.`}
          {total > 0
            ? ` ${total.toLocaleString()} upcoming ride${total === 1 ? '' : 's'} right now.`
            : ''}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        }
      >
        <TripsView
          initialData={initialData}
          cities={cities}
          lockedOriginCity={origin}
          lockedDestinationCity={destination ?? undefined}
        />
      </Suspense>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-border-subtle pt-6">
        <Link
          href="/dashboard/trips/new"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
        >
          {destinationName ? 'Driving this route? Post your trip' : `Driving from ${originName}? Post your trip`}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
