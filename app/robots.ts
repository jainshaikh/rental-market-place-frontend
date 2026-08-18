import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rentalmarket.ae';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/vehicles', '/vehicles/'],
        disallow: [
          '/admin/',
          '/provider/',
          '/dashboard/',
          '/api/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
