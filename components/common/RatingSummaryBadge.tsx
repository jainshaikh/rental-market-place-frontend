'use client';

import { useRatingSummary } from '../../hooks/useReviews';
import { RatingBadge } from '../ui';
import type { ReviewSubjectType } from '../../lib/api/reviews.api';

interface RatingSummaryBadgeProps {
  subjectType: ReviewSubjectType;
  subjectId: string | undefined;
  size?: 'sm' | 'md';
  className?: string;
}

// Small client island dropped into server-rendered detail pages — fetches and
// renders a subject's public rating summary ("★ 4.8 (23)" or "No ratings yet").
export function RatingSummaryBadge({ subjectType, subjectId, size, className }: RatingSummaryBadgeProps) {
  const { data, isLoading } = useRatingSummary(subjectType, subjectId);
  if (isLoading || !subjectId) return null;
  return <RatingBadge average={data?.average ?? null} count={data?.count ?? 0} size={size} className={className} />;
}
