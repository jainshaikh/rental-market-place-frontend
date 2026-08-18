import apiClient from './client';
import type { ApiResponse, ProviderVehicle, VehicleImageFull } from '../../types/api.types';

export interface CreateVehiclePayload {
  title: string;
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuelType: string;
  seatingCapacity: number;
  engineType?: string;
  pricePerDay: number;
  pricePerWeek?: number;
  locationText?: string;
  availabilityNotes?: string;
  pricingNotes?: string;
  specialConditions?: string;
  showroomId?: string;
  features?: string[];
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export interface AddVehicleImagePayload {
  url: string;
  publicId: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface VehicleListItem extends Omit<ProviderVehicle, 'features' | 'availabilityNotes' | 'pricingNotes' | 'specialConditions'> {
  images: VehicleImageFull[];
  _count?: { bookingRequests: number };
}

export const vehiclesApi = {
  create: async (data: CreateVehiclePayload) => {
    const res = await apiClient.post<ApiResponse<ProviderVehicle>>('/vehicles', data);
    return res.data;
  },

  getMyVehicles: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const res = await apiClient.get<ApiResponse<VehicleListItem[]>>('/vehicles', { params });
    return res.data;
  },

  getVehicle: async (id: string) => {
    const res = await apiClient.get<ApiResponse<ProviderVehicle>>(`/vehicles/${id}`);
    return res.data;
  },

  update: async (id: string, data: UpdateVehiclePayload) => {
    const res = await apiClient.patch<ApiResponse<ProviderVehicle>>(`/vehicles/${id}`, data);
    return res.data;
  },

  submitForReview: async (id: string) => {
    const res = await apiClient.post<ApiResponse<ProviderVehicle>>(`/vehicles/${id}/submit-for-review`);
    return res.data;
  },

  archive: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ id: string; status: string }>>(`/vehicles/${id}`);
    return res.data;
  },

  addImage: async (vehicleId: string, data: AddVehicleImagePayload) => {
    const res = await apiClient.post<ApiResponse<VehicleImageFull>>(`/vehicles/${vehicleId}/images`, data);
    return res.data;
  },

  removeImage: async (vehicleId: string, imageId: string) => {
    const res = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/vehicles/${vehicleId}/images/${imageId}`);
    return res.data;
  },

  reorderImages: async (vehicleId: string, imageIds: string[]) => {
    const res = await apiClient.patch<ApiResponse<VehicleImageFull[]>>(
      `/vehicles/${vehicleId}/images/reorder`,
      { imageIds },
    );
    return res.data;
  },
};
