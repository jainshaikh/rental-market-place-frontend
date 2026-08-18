import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    default: 'Account',
    template: '%s | Rental Marketplace',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      {/* Minimal header */}
      <header className="px-6 py-6">
        <Link href="/" className="flex w-fit items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-control bg-brand-600">
            <span className="text-sm font-bold text-white">R</span>
          </div>
          <span className="text-lg font-semibold text-ink">RentalMarket</span>
        </Link>
      </header>

      {/* Content area — width is controlled per-page (login/forgot/reset/verify
          stay a narrow centered card; register spans wider for its split panel) */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>

      <footer className="py-6 text-center text-sm text-text-muted">
        <p>
          &copy; {new Date().getFullYear()} Rental Marketplace.{' '}
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>{' '}
          &middot;{' '}
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
        </p>
      </footer>
    </div>
  );
}
