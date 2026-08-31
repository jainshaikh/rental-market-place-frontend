'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import { LocationSearch } from '../maps/LocationSearch';

interface HeroSearchProps {
  cities: string[];
}

export function HeroSearch({ cities }: HeroSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');

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

      <LocationSearch className="mt-2.5" />
    </div>
  );
}
