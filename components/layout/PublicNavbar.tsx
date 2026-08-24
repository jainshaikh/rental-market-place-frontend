'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

const NAV_LINKS = [
  { href: '/vehicles', label: 'Browse Vehicles' },
  { href: '/providers', label: 'Providers' },
  { href: '/trips', label: 'Intercity Trips' },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const userRole = Cookies.get('userRole');
  const [menuOpen, setMenuOpen] = useState(false);

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
          {/* Mobile menu trigger — only below the sm breakpoint, where the nav links hide */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-1.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-control text-ink transition-colors hover:bg-surface-hover sm:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

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
                <span className="hidden sm:inline">Dashboard</span>
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

      {/* Mobile nav — left slide-in sheet, mirrors the desktop nav + auth links */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-fade-in sm:hidden" />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-50 flex h-full w-[280px] max-w-[80vw] flex-col bg-surface shadow-lg focus:outline-none data-[state=open]:animate-slide-in-left sm:hidden"
            aria-describedby={undefined}
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-[18px]">
              <Dialog.Title asChild>
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <span className="bg-brand flex h-[26px] w-[26px] items-center justify-center rounded-[9px] text-[13px] font-bold text-white">
                    R
                  </span>
                  <span className="text-[15px] font-bold tracking-[-0.03em] text-ink">
                    RentalMarket
                  </span>
                </Link>
              </Dialog.Title>
              <Dialog.Close className="rounded-control p-1.5 text-text-faint hover:bg-surface-hover hover:text-slate-600">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <nav className="flex flex-col gap-0.5 px-3 py-4">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'rounded-control px-3.5 py-3 text-[15px] font-medium transition-colors',
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-ink hover:bg-surface-hover',
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-2 border-t border-border-subtle p-4">
              {isAuthenticated ? (
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-control bg-surface-hover px-4 py-3 text-sm font-semibold text-ink"
                >
                  Dashboard
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center rounded-control border border-border-strong px-4 py-3 text-sm font-semibold text-ink"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="bg-brand flex items-center justify-center rounded-control px-4 py-3 text-sm font-semibold text-white"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
