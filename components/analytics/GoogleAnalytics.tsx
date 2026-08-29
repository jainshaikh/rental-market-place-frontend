import Script from 'next/script';

// Loaded once from the root layout, applies to every page. `afterInteractive`
// (Next.js's recommended strategy for analytics tags) lets the page become
// interactive first, then loads GA — avoids blocking the initial render.
// Renders nothing when NEXT_PUBLIC_GA_ID isn't set (e.g. local dev), so
// there's no broken/empty gtag call anywhere.
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
