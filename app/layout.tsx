import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { QueryProvider } from '../lib/providers/query-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({
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
  keywords: ['car rental', 'vehicle hire', 'rental marketplace', 'book a car', 'Dubai car rental', 'UAE rental'],
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
