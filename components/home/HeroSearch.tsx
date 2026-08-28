'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Search, ChevronDown, LocateFixed, Loader2 } from 'lucide-react';
import { getCurrentCoords, nearestCity } from '../../lib/utils/geolocation';

interface HeroSearchProps {
  cities: string[];
}

const PREFERRED_CITY_COOKIE = 'preferredCity';

export function HeroSearch({ cities }: HeroSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [locating, setLocating] = useState(false);

  const requestLocation = async (silent: boolean) => {
    setLocating(true);
    try {
      const coords = await getCurrentCoords();
      const detected = nearestCity(coords, cities);
      if (detected) {
        setCity(detected);
        Cookies.set(PREFERRED_CITY_COOKIE, detected, { expires: 365, sameSite: 'lax' });
        toast.success(`Showing ${detected.charAt(0).toUpperCase()}${detected.slice(1)} first`);
        // Re-runs the server components on this page (homepage sections that
        // read the cookie) with the fresh value — no full reload needed.
        router.refresh();
      } else if (!silent) {
        toast.error("We don't have listings near your location yet");
      }
    } catch {
      // Silent on the automatic on-load attempt — a denied/blocked prompt
      // shouldn't greet a first-time visitor with an error. The manual
      // button below still surfaces it, since there the user explicitly asked.
      if (!silent) toast.error('Could not get your location — check your browser permissions');
    } finally {
      setLocating(false);
    }
  };

  // Pre-fill only — never navigates anyone anywhere on its own, and never
  // asked twice: a prior choice (this session or an earlier one) is
  // remembered via cookie, so the browser's own location prompt only fires
  // once per visitor, the first time they land on the homepage.
  useEffect(() => {
    const saved = Cookies.get(PREFERRED_CITY_COOKIE);
    if (saved) {
      if (cities.some((c) => c.toLowerCase() === saved.toLowerCase())) setCity(saved.toLowerCase());
      return;
    }
    if (cities.length > 0) void requestLocation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities]);

  const handleUseLocation = () => requestLocation(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (city) params.set('city', city);
    router.push(`/rent-a-car${params.size ? `?${params}` : ''}`);
  };

  return (
    <div className="max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-sheet border border-white/15 bg-white/[0.07] p-2 backdrop-blur-md transition-colors duration-200 focus-within:border-white/30 sm:flex-row"
      >
        {/* Search input */}
        <div className="flex flex-1 items-center gap-2.5 rounded-media bg-surface px-4">
          <Search className="h-4 w-4 flex-shrink-0 text-text-faint" />
          <input
            type="text"
            placeholder="Make, model, or keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 flex-1 bg-transparent text-sm text-ink placeholder-text-faint focus:outline-none"
          />
        </div>

        {/* City select — native select, custom chevron. appearance-none removes the
            platform arrow so the icon can inherit our palette. */}
        {cities.length > 0 && (
          <div className="relative flex-shrink-0 rounded-media bg-surface">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="City"
              className="h-11 w-full appearance-none bg-transparent pl-4 pr-10 text-sm font-medium text-ink focus:outline-none sm:w-auto"
            >
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="bg-brand shadow-coral ease-spring hover:shadow-coral-lg h-11 flex-shrink-0 rounded-media px-6 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          Search
        </button>
      </form>

      {cities.length > 0 && (
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-white/60 transition-colors hover:text-white disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LocateFixed className="h-3.5 w-3.5" />
          )}
          {locating ? 'Finding your city…' : 'Use my location'}
        </button>
      )}
    </div>
  );
}
