import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { fetchPriceIndex } from '../../../../lib/api/server';

export const metadata: Metadata = {
  title: 'Pakistan Car Rental Price Index — Real Daily Rates by City',
  description:
    'Real, live daily rental prices from KerayeGo\'s marketplace — average, minimum, and maximum rates by city and vehicle make across Pakistan, updated regularly from actual listings.',
  keywords: [
    'car rental price Pakistan',
    'average car rental price',
    'car rental rates by city Pakistan',
    'cheapest city car rental Pakistan',
  ],
  alternates: {
    canonical: '/rent-a-car/price-index',
  },
  openGraph: {
    title: 'Pakistan Car Rental Price Index',
    description: 'Real average, minimum, and maximum daily rental rates by city and vehicle make, from live KerayeGo listings.',
  },
};

function toDisplayName(value: string): string {
  return value
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

export default async function PriceIndexPage() {
  const res = await fetchPriceIndex();
  const data = res?.data;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Rent a Car', item: '/rent-a-car' },
      { '@type': 'ListItem', position: 3, name: 'Price Index', item: '/rent-a-car/price-index' },
    ],
  };

  const generatedAt = data?.generatedAt ? new Date(data.generatedAt) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
        <span className="font-semibold text-ink">Price Index</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight text-ink">
          Pakistan Car Rental Price Index
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          Real daily rental rates computed directly from vehicles currently listed on KerayeGo —
          not estimates. Prices vary by vehicle condition, provider, and season; use this as a
          starting reference, not a quote.
        </p>
        {generatedAt && (
          <p className="mt-2 text-xs text-text-faint">
            Last updated{' '}
            {generatedAt.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      {!data?.overall ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-600">Not enough listings yet to publish a price index.</p>
          <Link href="/rent-a-car" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
            Browse all vehicles
          </Link>
        </div>
      ) : (
        <>
          {/* Overall summary */}
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Vehicles tracked" value={data.overall.count.toLocaleString()} />
            <StatTile label="Lowest daily rate" value={formatPKR(data.overall.minPrice)} />
            <StatTile label="Average daily rate" value={formatPKR(data.overall.avgPrice)} />
            <StatTile label="Highest daily rate" value={formatPKR(data.overall.maxPrice)} />
          </div>

          {/* By city */}
          {data.byCity.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-3 text-lg font-semibold text-ink">Average daily price by city</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-surface-hover text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Vehicles</th>
                      <th className="px-4 py-3">Lowest</th>
                      <th className="px-4 py-3">Median</th>
                      <th className="px-4 py-3">Average</th>
                      <th className="px-4 py-3">Highest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {data.byCity.map((row) => (
                      <tr key={row.city}>
                        <td className="px-4 py-3 font-medium text-ink">
                          <Link href={`/rent-a-car/${encodeURIComponent(row.city)}`} className="hover:text-brand-700 hover:underline">
                            {toDisplayName(row.city)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-text-muted">{row.count}</td>
                        <td className="px-4 py-3 font-mono text-text-muted">{formatPKR(row.minPrice)}</td>
                        <td className="px-4 py-3 font-mono text-text-muted">{formatPKR(row.medianPrice)}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-ink">{formatPKR(row.avgPrice)}</td>
                        <td className="px-4 py-3 font-mono text-text-muted">{formatPKR(row.maxPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* By make */}
          {data.byMake.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-ink">Average daily price by make</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-surface-hover text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                      <th className="px-4 py-3">Make</th>
                      <th className="px-4 py-3">Vehicles</th>
                      <th className="px-4 py-3">Lowest</th>
                      <th className="px-4 py-3">Median</th>
                      <th className="px-4 py-3">Average</th>
                      <th className="px-4 py-3">Highest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {data.byMake.map((row) => (
                      <tr key={row.make}>
                        <td className="px-4 py-3 font-medium text-ink">
                          <Link href={`/rent-a-car?make=${encodeURIComponent(row.make)}`} className="hover:text-brand-700 hover:underline">
                            {toDisplayName(row.make)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-text-muted">{row.count}</td>
                        <td className="px-4 py-3 font-mono text-text-muted">{formatPKR(row.minPrice)}</td>
                        <td className="px-4 py-3 font-mono text-text-muted">{formatPKR(row.medianPrice)}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-ink">{formatPKR(row.avgPrice)}</td>
                        <td className="px-4 py-3 font-mono text-text-muted">{formatPKR(row.maxPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control border border-border-subtle bg-surface p-3.5">
      <div className="mb-1 text-[11px] text-text-faint">{label}</div>
      <div className="font-mono text-[15px] font-semibold text-ink">{value}</div>
    </div>
  );
}
