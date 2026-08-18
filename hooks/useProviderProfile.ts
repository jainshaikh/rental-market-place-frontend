'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { providersApi, type UpdateProviderPayload, type CreateShowroomPayload } from '../lib/api/providers.api';
export type { CreateShowroomPayload };

export const providerQueryKeys = {
  myProfile: ['provider', 'me'] as const,
  showrooms: ['provider', 'showrooms'] as const,
};

export function useProviderProfile() {
  return useQuery({
    queryKey: providerQueryKeys.myProfile,
    queryFn: () => providersApi.getMyProfile().then((r) => r.data),
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProviderPayload) => providersApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.myProfile });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });
}

export function useSubmitForReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => providersApi.submitForReview(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.myProfile });
      toast.success('Profile submitted for review! We\'ll notify you by email.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Submission failed';
      toast.error(msg);
    },
  });
}

export function useCreateShowroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShowroomPayload) => providersApi.createShowroom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.myProfile });
      toast.success('Showroom added');
    },
    onError: () => toast.error('Failed to add showroom'),
  });
}

export function useUpdateShowroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ showroomId, data }: { showroomId: string; data: Partial<CreateShowroomPayload> }) =>
      providersApi.updateShowroom(showroomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.myProfile });
      toast.success('Showroom updated');
    },
    onError: () => toast.error('Failed to update showroom'),
  });
}

export function useDeleteShowroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (showroomId: string) => providersApi.deleteShowroom(showroomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKeys.myProfile });
      toast.success('Showroom removed');
    },
    onError: () => toast.error('Failed to remove showroom'),
  });
}
