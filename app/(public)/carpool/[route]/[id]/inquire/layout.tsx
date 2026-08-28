import type { Metadata } from 'next';

// Same reasoning as vehicles/[slug]/inquire/layout.tsx — client-component
// form page, noindexed so it doesn't get crawled as a thin duplicate of the
// trip detail page.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TripInquireLayout({ children }: { children: React.ReactNode }) {
  return children;
}
