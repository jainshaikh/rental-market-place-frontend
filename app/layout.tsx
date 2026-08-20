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
  // NOTE: locale. The rest of the app is Pakistan (PKR in VehicleCard and
  // TripCard, +92 in register, "across Pakistan" in providers/page.tsx).
  // These keywords and the openGraph locale below are the outliers — decide
  // which market wins, then fix this file and app/page.tsx together.
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
