import apiClient from './client';
import type { ApiResponse, PaginationMeta, Market } from '../../types/api.types';

export type TripStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'SUSPENDED';

export interface TripVehicleImage {
  url: string;
  altText: string | null;
}

export interface TripVehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  country: Market;
  // Card responses include only the cover (sortOrder 0); detail includes the full gallery.
  images: TripVehicleImage[];
}

// ── Public shapes ────────────────────────────────────────────────────────────

export interface TripCard {
  id: string;
  originCity: string;
  destinationCity: string;
  pickupPoint: string;
  pickupLat: number | null;
  pickupLng: number | null;
  dropoffPoint: string | null;
  dropoffLat: number | null;
  dropoffLng: number | null;
  departureAt: string;
  availableSeats: number;
  pricePerSeat: string | number;
  contactNumber: string;
  notes: string | null;
  status: TripStatus;
  createdAt: string;
  postedBy: { id: string; name: string };
  userVehicle: TripVehicle;
}

export interface TripDetail extends TripCard {
  rejectionReason: string | null;
  cancelReason: string | null;
  updatedAt: string;
  userVehicle: TripVehicle & { plateNumber: string; status: string };
}

export interface TripFilters {
  originCity?: string;
  destinationCity?: string;
  date?: string;
  minSeats?: number;
  sort?: 'departure_asc' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
  priceMin?: number;
  priceMax?: number;
  pickupPoint?: string;
  dropoffPoint?: string;
  /** Free-text match against the trip's vehicle make or model. */
  vehicleSearch?: string;
}

export interface TripsResponse {
  data: TripCard[];
  meta: PaginationMeta;
}

export interface TripMetaCities {
  origins: string[];
  destinations: string[];
}

export interface TripRouteGroup {
  originCity: string;
  destinationCity: string;
  tripCount: number;
  minPricePerSeat: string | number | null;
  nextDepartureAt: string | null;
}

// ── Poster shapes ─────────────────────────────────────────────────────────

export interface CreateTripPayload {
  userVehicleId: string;
  originCity: string;
  destinationCity: string;
  pickupPoint: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffPoint?: string;
  dropoffLat?: number;
  dropoffLng?: number;
  departureAt: string;
  availableSeats: number;
  pricePerSeat: number;
  contactNumber: string;
  notes?: string;
}

export type UpdateTripPayload = Partial<CreateTripPayload>;

export type MyTrip = TripDetail;

export const tripsApi = {
  // Public search
  getAll: async (filters: TripFilters = {}): Promise<TripsResponse> => {
    const params: Record<string, string | number | undefined> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) {
        params[k] = v as string | number;
      }
    });

    const res = await apiClient.get<ApiResponse<TripCard[]>>('/trips', { params });
    return { data: res.data.data, meta: res.data.meta as PaginationMeta };
  },

  getById: async (id: string): Promise<TripDetail> => {
    const res = await apiClient.get<ApiResponse<TripDetail>>(`/trips/${id}`);
    return res.data.data;
  },

  getMetaCities: async (): Promise<TripMetaCities> => {
    const res = await apiClient.get<ApiResponse<TripMetaCities>>('/trips/meta/cities');
    return res.data.data;
  },

  getRouteGroups: async (): Promise<TripRouteGroup[]> => {
    const res = await apiClient.get<ApiResponse<TripRouteGroup[]>>('/trips/meta/routes');
    return res.data.data;
  },

  // Poster operations
  create: async (data: CreateTripPayload): Promise<MyTrip> => {
    const res = await apiClient.post<ApiResponse<MyTrip>>('/trips', data);
    return res.data.data;
  },

  getMyTrips: async (params?: { page?: number; limit?: number }): Promise<{ data: MyTrip[]; meta: PaginationMeta }> => {
    const res = await apiClient.get<ApiResponse<MyTrip[]>>('/my/trips', { params });
    return { data: res.data.data, meta: res.data.meta as PaginationMeta };
  },

  getMyTrip: async (id: string): Promise<MyTrip> => {
    const res = await apiClient.get<ApiResponse<MyTrip>>(`/my/trips/${id}`);
    return res.data.data;
  },

  update: async (id: string, data: UpdateTripPayload): Promise<MyTrip> => {
    const res = await apiClient.patch<ApiResponse<MyTrip>>(`/my/trips/${id}`, data);
    return res.data.data;
  },

  cancel: async (id: string, reason?: string): Promise<MyTrip> => {
    const res = await apiClient.patch<ApiResponse<MyTrip>>(`/my/trips/${id}/cancel`, { reason });
    return res.data.data;
  },
};
