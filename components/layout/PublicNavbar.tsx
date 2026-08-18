'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { cn } from '../../lib/utils/cn';

export function PublicNavbar() {
  const pathname = usePathname();
  const userRole = Cookies.get('userRole');

  const getDashboardHref = () => {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') return '/admin/dashboard';
    if (userRole === 'PROVIDER') return '/provider/dashboard';
    return '/dashboard';
  };

  const isAuthenticated = !!userRole;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight flex-shrink-0">
            RentalMarket
          </Link>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/vehicles"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname.startsWith('/vehicles') ? 'text-primary' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              Browse Vehicles
            </Link>
            <Link
              href="/providers"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname.startsWith('/providers') ? 'text-primary' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              Providers
            </Link>
            <Link
              href="/trips"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname.startsWith('/trips') ? 'text-primary' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              Intercity Trips
            </Link>
          </nav>

          {/* Auth actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href={getDashboardHref()}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Dashboard
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
