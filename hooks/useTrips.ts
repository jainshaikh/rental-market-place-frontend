'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  tripsApi,
  type CreateTripPayload,
  type UpdateTripPayload,
} from '../lib/api/trips.api';
import { trackEvent } from '../lib/utils/analytics';

function errorMessage(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { error?: { message?: string } } } })
      ?.response?.data?.error?.message ?? fallback
  );
}

// ── Poster hooks (any signed-in user) ────────────────────────────────────

export function useMyTrips(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['trips', 'my', params],
    queryFn: () => tripsApi.getMyTrips(params),
  });
}

export function useMyTrip(id: string) {
  return useQuery({
    queryKey: ['trips', 'my', 'detail', id],
    queryFn: () => tripsApi.getMyTrip(id),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTripPayload) => tripsApi.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'my'] });
      trackEvent('offer_ride', { origin_city: variables.originCity, destination_city: variables.destinationCity });
      toast.success('Trip posted — now visible to riders');
    },
    onError: (error: unknown) => toast.error(errorMessage(error, 'Failed to post trip')),
  });
}

export function useUpdateTrip(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTripPayload) => tripsApi.update(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'my'] });
      toast.success('Trip updated');
    },
    onError: (error: unknown) => toast.error(errorMessage(error, 'Failed to update trip')),
  });
}

export function useCancelTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => tripsApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'my'] });
      toast.success('Trip cancelled');
    },
    onError: (error: unknown) => toast.error(errorMessage(error, 'Failed to cancel trip')),
  });
}
