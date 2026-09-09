import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../lib/api/users.api';
import { useAuth } from './useAuth';

const SAVED_VEHICLES_KEY = ['savedVehicles'] as const;

export function useSavedVehicles(page = 1, limit = 20) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...SAVED_VEHICLES_KEY, page, limit],
    queryFn: () => usersApi.getSavedVehicles(page, limit),
    enabled: isAuthenticated,
  });
}

// A generous limit avoids a dedicated "is this vehicle saved" endpoint —
// mirrors the same tradeoff the mobile app makes; revisit if a user's saved
// list grows past this.
export function useAllSavedVehicles() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...SAVED_VEHICLES_KEY, 'all'],
    queryFn: () => usersApi.getSavedVehicles(1, 100),
    enabled: isAuthenticated,
  });
}

export function useIsVehicleSaved(vehicleId: string | undefined): boolean {
  const saved = useAllSavedVehicles();
  if (!vehicleId) return false;
  return !!saved.data?.data.some((entry) => entry.vehicleId === vehicleId);
}

export function useSaveVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: string) => usersApi.saveVehicle(vehicleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SAVED_VEHICLES_KEY }),
  });
}

export function useRemoveSavedVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: string) => usersApi.removeSavedVehicle(vehicleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SAVED_VEHICLES_KEY }),
  });
}
