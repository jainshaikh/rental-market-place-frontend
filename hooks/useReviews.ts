import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  reviewsApi,
  type ReviewSubjectType,
  type CreateReviewPayload,
} from '../lib/api/reviews.api';

export function usePublicReviews(subjectType: ReviewSubjectType, subjectId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ['reviews', subjectType, subjectId, page],
    queryFn: () => reviewsApi.getPublic(subjectType, subjectId as string, page),
    enabled: !!subjectId,
  });
}

export function useRatingSummary(subjectType: ReviewSubjectType, subjectId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', 'summary', subjectType, subjectId],
    queryFn: () => reviewsApi.getSummary(subjectType, subjectId as string),
    enabled: !!subjectId,
    staleTime: 60_000,
  });
}

export function useMyEligibleReviews() {
  return useQuery({
    queryKey: ['reviews', 'my', 'eligible'],
    queryFn: reviewsApi.getMyEligible,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewPayload) => reviewsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Rating submitted — thank you');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to submit rating');
    },
  });
}
