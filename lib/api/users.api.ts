import apiClient from './client';
import type { ApiResponse, User, SavedVehicle, PaginationMeta } from '../../types/api.types';

export const usersApi = {
  getMe: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  updateMe: async (data: { name?: string; phone?: string }) => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);
    return response.data;
  },

  getSavedVehicles: async (page = 1, limit = 20) => {
    const response = await apiClient.get<ApiResponse<SavedVehicle[]> & { meta: PaginationMeta }>(
      '/users/me/saved-vehicles',
      { params: { page, limit } },
    );
    return response.data;
  },

  saveVehicle: async (vehicleId: string) => {
    const response = await apiClient.post<ApiResponse<{ id: string; vehicleId: string }>>(
      '/users/me/saved-vehicles',
      { vehicleId },
    );
    return response.data;
  },

  removeSavedVehicle: async (vehicleId: string) => {
    await apiClient.delete(`/users/me/saved-vehicles/${vehicleId}`);
  },
};
