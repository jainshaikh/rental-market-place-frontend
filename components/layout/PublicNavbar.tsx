'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

const NAV_LINKS = [
  { href: '/vehicles', label: 'Browse Vehicles' },
  { href: '/providers', label: 'Providers' },
  { href: '/trips', label: 'Intercity Trips' },
];

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
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-page backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between gap-6">
          {/* Logo — gradient glyph tile + wordmark */}
          <Link href="/" className="group flex flex-shrink-0 items-center gap-2.5">
            <span className="bg-brand shadow-coral ease-spring flex h-[30px] w-[30px] items-center justify-center rounded-[9px] text-[15px] font-bold text-white transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
              R
            </span>
            <span className="text-[17px] font-bold tracking-[-0.03em] text-ink">RentalMarket</span>
          </Link>

          {/* Nav links — active state is a tinted pill, not a colour change */}
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative rounded-control px-3.5 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-text-muted hover:bg-surface-hover hover:text-ink',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Auth actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                href={getDashboardHref()}
                className="group inline-flex h-[38px] items-center gap-1 rounded-control px-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-hover"
              >
                Dashboard
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-[38px] items-center rounded-control px-3.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-brand shadow-coral ease-spring hover:shadow-coral-lg inline-flex h-[38px] items-center rounded-control px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
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
