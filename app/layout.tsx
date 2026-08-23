import type { Metadata } from 'next';
import { Outfit, IBM_Plex_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { QueryProvider } from '../lib/providers/query-provider';
import './globals.css';

// The CSS variable names are unchanged (--font-inter / --font-mono) so
// tailwind.config.ts needs no edit — only the font filling them changed.
const sans = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rentalmarket.ae';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Rental Marketplace — Find Your Perfect Car',
    template: '%s | Rental Marketplace',
  },
  description:
    'Discover and book rental vehicles from verified providers. Compare prices, browse fleets, and submit booking inquiries easily.',
  // NOTE: as of the 2026-08-23 multi-market work, currency display across
  // the app is dynamic per listing/trip (see lib/utils/currency.ts) — Pakistan
  // and Saudi Arabia/UAE data now coexist correctly. This file's UAE-flavored
  // keywords/locale and the Pakistan-flavored copy still in app/page.tsx's
  // marketing text remain un-reconciled — that's a content/SEO decision
  // (which market's story leads on the homepage), not a data-model gap.
  keywords: [
    'car rental',
    'vehicle hire',
    'rental marketplace',
    'book a car',
    'Dubai car rental',
    'UAE rental',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    siteName: 'Rental Marketplace',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rentalmarket',
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
