'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

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
    router.push(`/vehicles${params.size ? `?${params}` : ''}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 max-w-xl bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2"
    >
      {/* Search input */}
      <div className="flex items-center gap-2 flex-1 bg-white rounded-xl px-4 py-2.5">
        <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Make, model, or keyword…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* City select */}
      {cities.length > 0 && (
        <div className="bg-white rounded-xl px-3 py-2.5 flex-shrink-0">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="text-sm text-slate-700 focus:outline-none bg-transparent"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex-shrink-0"
      >
        Search
      </button>
    </form>
  );
}
