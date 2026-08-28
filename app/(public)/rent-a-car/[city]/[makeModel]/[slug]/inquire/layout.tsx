import type { Metadata } from 'next';

// The inquire page is a client component (form + auth redirect logic), so it
// can't export `metadata` itself — this layout carries it instead. Noindexed
// because it's a transactional form, not a content page: letting it get
// indexed would just create a thin duplicate of the vehicle detail page.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function InquireLayout({ children }: { children: React.ReactNode }) {
  return children;
}
