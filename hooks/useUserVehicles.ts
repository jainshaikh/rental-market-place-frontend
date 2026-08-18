'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userVehiclesApi, type CreateUserVehiclePayload } from '../lib/api/user-vehicles.api';

function errorMessage(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { error?: { message?: string } } } })
      ?.response?.data?.error?.message ?? fallback
  );
}

export function useMyUserVehicles() {
  return useQuery({
    queryKey: ['user-vehicles', 'my'],
    queryFn: () => userVehiclesApi.getMine(),
  });
}

export function useMyApprovedUserVehicles() {
  return useQuery({
    queryKey: ['user-vehicles', 'my', 'approved'],
    queryFn: () => userVehiclesApi.getMyApproved(),
  });
}

export function useMyUserVehicle(id: string) {
  return useQuery({
    queryKey: ['user-vehicles', 'my', 'detail', id],
    queryFn: () => userVehiclesApi.getMyOne(id),
    enabled: !!id,
  });
}

export function useCreateUserVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserVehiclePayload) => userVehiclesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-vehicles', 'my'] });
      toast.success('Vehicle submitted — we\'ll verify your documents shortly');
    },
    onError: (error: unknown) => toast.error(errorMessage(error, 'Failed to submit vehicle')),
  });
}
