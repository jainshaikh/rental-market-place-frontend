'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  vehiclesApi,
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
  type AddVehicleImagePayload,
} from '../lib/api/vehicles.api';
import { trackEvent } from '../lib/utils/analytics';

export const vehicleQueryKeys = {
  myVehicles: (params?: object) => ['vehicles', 'my', params] as const,
  vehicle: (id: string) => ['vehicles', id] as const,
};

export function useMyVehicles(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: vehicleQueryKeys.myVehicles(params),
    queryFn: () => vehiclesApi.getMyVehicles(params).then((r) => r),
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleQueryKeys.vehicle(id),
    queryFn: () => vehiclesApi.getVehicle(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehiclePayload) => vehiclesApi.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'my'] });
      trackEvent('list_vehicle_complete', { make: variables.make, model: variables.model });
      toast.success('Vehicle created as draft');
    },
    onError: () => toast.error('Failed to create vehicle'),
  });
}

export function useUpdateVehicle(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateVehiclePayload) => vehiclesApi.update(vehicleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleQueryKeys.vehicle(vehicleId) });
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'my'] });
      toast.success('Vehicle updated');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to update vehicle';
      toast.error(msg);
    },
  });
}

export function useSubmitVehicleForReview(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => vehiclesApi.submitForReview(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleQueryKeys.vehicle(vehicleId) });
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'my'] });
      toast.success('Submitted for review! We\'ll notify you once approved.');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Submission failed';
      toast.error(msg);
    },
  });
}

export function useArchiveVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: string) => vehiclesApi.archive(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'my'] });
      toast.success('Vehicle archived');
    },
    onError: () => toast.error('Failed to archive vehicle'),
  });
}

export function useAddVehicleImage(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddVehicleImagePayload) => vehiclesApi.addImage(vehicleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleQueryKeys.vehicle(vehicleId) });
    },
    onError: () => toast.error('Failed to add image'),
  });
}

export function useRemoveVehicleImage(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => vehiclesApi.removeImage(vehicleId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleQueryKeys.vehicle(vehicleId) });
      toast.success('Image removed');
    },
    onError: () => toast.error('Failed to remove image'),
  });
}

export function useReorderVehicleImages(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageIds: string[]) => vehiclesApi.reorderImages(vehicleId, imageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleQueryKeys.vehicle(vehicleId) });
    },
    onError: () => toast.error('Failed to reorder images'),
  });
}
