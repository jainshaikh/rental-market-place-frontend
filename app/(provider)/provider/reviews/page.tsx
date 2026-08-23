'use client';

import { EligibleReviewsList } from '../../../../components/reviews/EligibleReviewsList';

export default function ProviderReviewsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Rate your rides</h1>
        <p className="mt-1 text-sm text-text-muted">
          Rate completed rentals and departed trips. Customer/rider ratings you give are private —
          used internally only, never shown on their profile.
        </p>
      </div>
      <EligibleReviewsList />
    </div>
  );
}
