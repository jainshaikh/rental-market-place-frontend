import apiClient from './client';
import type { ApiResponse } from '../../types/api.types';

export interface ReverseGeocodeResult {
  label: string;
  city: string | null;
  formattedAddress: string;
}

export const geoApi = {
  reverseGeocode: async (lat: number, lng: number): Promise<ReverseGeocodeResult> => {
    const res = await apiClient.get<ApiResponse<ReverseGeocodeResult>>('/geo/reverse', {
      params: { lat, lng },
    });
    return res.data.data;
  },
};
