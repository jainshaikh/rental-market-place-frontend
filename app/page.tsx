import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchFeaturedListings, fetchDistinctMakes, fetchDistinctCities } from '../lib/api/server';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { VehicleCard } from '../components/listings/VehicleCard';
import type { ListingVehicleCard } from '../lib/api/listings.api';
import { HeroSearch } from '../components/home/HeroSearch';

export const metadata: Metadata = {
  title: 'Rental Marketplace — Find Your Perfect Car in the UAE',
  description:
    'Browse hundreds of rental vehicles from verified providers across Dubai, Abu Dhabi, and the UAE. Compare prices, check availability, and send inquiries in seconds.',
  openGraph: {
    title: 'Rental Marketplace — Find Your Perfect Car',
    description: 'Verified rental providers. No hidden fees. Book in minutes.',
  },
};

export default async function HomePage() {
  const [featuredRes, citiesRes] = await Promise.all([
    fetchFeaturedListings(6),
    fetchDistinctCities(),
  ]);

  const featured: ListingVehicleCard[] = featuredRes?.data ?? [];
  const cities: string[] = citiesRes?.data ?? [];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Verified providers across the UAE
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-5">
              Find your<br />
              <span className="text-primary">perfect rental</span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
              Browse vehicles from verified providers, compare options, and send a booking
              inquiry — all in one place. No hidden fees.
            </p>

            {/* Search bar */}
            <HeroSearch cities={cities} />

            {/* CTA row */}
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <Link
                href="/vehicles"
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Browse all vehicles
              </Link>
              <Link
                href="/register?role=PROVIDER"
                className="border border-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                List your fleet →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust signals ─────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '✓', title: 'Verified providers', sub: 'Every provider is reviewed' },
              { icon: '💬', title: 'Free to inquire', sub: 'No payment until confirmed' },
              { icon: '🔍', title: 'Transparent pricing', sub: 'Daily and weekly rates shown' },
              { icon: '⚡', title: 'Fast response', sub: 'Most providers reply same day' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-1.5">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured vehicles ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured vehicles</h2>
              <p className="text-slate-500 text-sm mt-1">Hand-picked from our top providers</p>
            </div>
            <Link
              href="/vehicles"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </section>
      )}

      {/* ── Browse by city ────────────────────────────────────────────── */}
      {cities.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Browse by city</h2>
            <div className="flex flex-wrap gap-3">
              {cities.slice(0, 10).map((city) => (
                <Link
                  key={city}
                  href={`/vehicles?city=${city}`}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors"
                >
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Provider CTA ──────────────────────────────────────────────── */}
      <section className="bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Own a fleet? List it here.</h2>
          <p className="text-white/80 mb-7 max-w-md mx-auto text-sm leading-relaxed">
            Join hundreds of verified providers. Reach thousands of customers looking to rent
            vehicles across the UAE. Free to sign up.
          </p>
          <Link
            href="/register?role=PROVIDER"
            className="inline-block bg-white text-primary px-7 py-3 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg"
          >
            Get started as a provider
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="font-semibold text-slate-600">RentalMarket</span>
          </div>
          <p>© {new Date().getFullYear()} Rental Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/vehicles" className="hover:text-slate-600">Browse</Link>
            <Link href="/register" className="hover:text-slate-600">Register</Link>
            <Link href="/login" className="hover:text-slate-600">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
