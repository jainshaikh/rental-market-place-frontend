import Link from 'next/link';
import type { PublicProviderCard } from '../../lib/api/providers.api';

export function ProviderCard({ provider }: { provider: PublicProviderCard }) {
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
          <h2 className="truncate font-semibold text-slate-900 transition-colors group-hover:text-primary">
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z"
            />
          </svg>
          {vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}
        </span>
        {provider.distanceKm !== undefined ? (
          <span className="flex items-center gap-1 font-medium text-primary">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {provider.distanceKm < 1
              ? `${Math.round(provider.distanceKm * 1000)} m away`
              : `${provider.distanceKm.toFixed(1)} km away`}
          </span>
        ) : (
          city && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {city.charAt(0).toUpperCase() + city.slice(1)}
            </span>
          )
        )}
      </div>
    </Link>
  );
}
