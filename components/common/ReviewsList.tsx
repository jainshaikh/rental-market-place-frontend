'use client';

import { usePublicReviews } from '../../hooks/useReviews';
import { RatingStars } from '../ui';
import type { ReviewSubjectType } from '../../lib/api/reviews.api';

interface ReviewsListProps {
  subjectType: ReviewSubjectType;
  subjectId: string | undefined;
  title?: string;
}

export function ReviewsList({ subjectType, subjectId, title = 'Reviews' }: ReviewsListProps) {
  const { data, isLoading } = usePublicReviews(subjectType, subjectId);

  if (!subjectId || isLoading) return null;
  if (!data || data.data.length === 0) {
    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
        <p className="text-sm text-text-muted">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">
        {title} <span className="text-text-faint">({data.meta.total})</span>
      </h3>
      <div className="space-y-4">
        {data.data.map((review) => (
          <div key={review.id} className="border-b border-border-subtle pb-4 last:border-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">{review.author.name}</span>
              <RatingStars value={review.rating} size="sm" />
            </div>
            {review.comment && <p className="mt-1.5 text-sm text-text-muted">{review.comment}</p>}
            <p className="mt-1 text-xs text-text-faint">
              {new Date(review.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
