import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchAllProviders } from '../../../lib/api/server';
import type { PublicProviderCard } from '../../../lib/api/providers.api';

export const metadata: Metadata = {
  title: 'Rental Providers — Rental Marketplace',
  description: 'Browse all verified vehicle rental providers in Pakistan.',
};

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page ?? 1);
  const res = await fetchAllProviders(page, 12);
  const providers = res?.data ?? [];
  const meta = res?.meta;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Rental Providers</h1>
        <p className="mt-2 text-slate-500">
          {meta ? `${meta.total} verified provider${meta.total !== 1 ? 's' : ''} across Pakistan` : 'Browse verified rental providers'}
        </p>
      </div>

      {providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700">No providers yet</p>
          <p className="mt-1 text-sm text-slate-400">Check back soon</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between text-sm">
              <p className="text-slate-500">
                Page {page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/providers?page=${page - 1}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                  >
                    Previous
                  </Link>
                )}
                {page < meta.totalPages && (
                  <Link
                    href={`/providers?page=${page + 1}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProviderCard({ provider }: { provider: PublicProviderCard }) {
  const city = provider.showrooms?.[0]?.city;
  const vehicleCount = provider._count?.vehicles ?? 0;
  const initial = provider.businessName?.trim()?.[0]?.toUpperCase() ?? '?';

  return (
    <Link
      href={`/providers/${provider.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        {/* Logo / initial */}
        <div className="flex-shrink-0">
          {provider.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.logoUrl}
              alt={provider.businessName}
              className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
              {initial}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate font-semibold text-slate-900 group-hover:text-primary transition-colors">
            {provider.businessName}
          </h2>
          {provider.isFeatured && (
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              Featured
            </span>
          )}
        </div>
      </div>

      {provider.businessDescription && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-500">{provider.businessDescription}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z" />
          </svg>
          {vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}
        </span>
        {city && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {city.charAt(0).toUpperCase() + city.slice(1)}
          </span>
        )}
      </div>
    </Link>
  );
}
