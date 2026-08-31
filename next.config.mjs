/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        // AWS S3 — matches https://<bucket>.s3.<region>.amazonaws.com/...
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            // geolocation=(self) — the "Use my location" nearby-search feature
            // (HeroSearch, VehiclesView, ProvidersView) needs this.
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/provider',
        destination: '/provider/dashboard',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
      // URL rename, 2026-08-28: /car-rental -> /rent-a-car, /trips -> /carpool
      // hub. Both were only briefly live pre-launch (not yet indexed), but
      // these cost nothing and protect anyone who bookmarked/shared a link
      // during that window.
      {
        source: '/car-rental/:path*',
        destination: '/rent-a-car/:path*',
        permanent: true,
      },
      {
        source: '/trips',
        destination: '/carpool',
        permanent: true,
      },
      // URL rename, 2026-08-28: /vehicles -> /rent-a-car (nav + browse-all
      // page). Individual /vehicles/:slug deep links aren't redirectable
      // this way — the new URL needs the vehicle's city/make/model, which a
      // static redirect can't look up — same limitation as /trips/:id above.
      // Not indexed yet, so the risk is negligible.
      {
        source: '/vehicles',
        destination: '/rent-a-car',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
