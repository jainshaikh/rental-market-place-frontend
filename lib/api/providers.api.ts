import apiClient from './client';
import type { ApiResponse, ProviderProfile, Showroom, PaginationMeta } from '../../types/api.types';
import type { ListingVehicleCard } from './listings.api';

export interface CreateProviderPayload {
  businessName: string;
  businessDescription?: string;
  contactPhone?: string;
}

export interface UpdateProviderPayload {
  businessName?: string;
  businessDescription?: string;
  logoUrl?: string;
}

export interface CreateShowroomPayload {
  name: string;
  address: string;
  city: string;
  area?: string;
  contactNumber: string;
  whatsappNumber?: string;
  operatingHours?: Record<string, string>;
  mapLat?: number;
  mapLng?: number;
}

export interface CompletenessScore {
  score: number;
  missing: string[];
  total: number;
  passed: number;
}

export interface ProviderProfileWithMeta extends ProviderProfile {
  showrooms: Showroom[];
  documents: UploadedDocument[];
  completenessScore: CompletenessScore;
  emailVerified: boolean;
}

export interface UploadedDocument {
  id: string;
  documentType: string;
  fileUrl: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
}

// ── Public directory types ────────────────────────────────────────────────────

export interface PublicProviderCard {
  id: string;
  businessName: string;
  slug: string;
  logoUrl: string | null;
  businessDescription: string | null;
  isFeatured: boolean;
  updatedAt: string;
  showrooms: { city: string; area: string | null }[];
  _count: { vehicles: number };
}

export interface PublicProviderShowroom {
  id: string;
  name: string;
  city: string;
  area: string | null;
  contactNumber: string;
  whatsappNumber: string | null;
  operatingHours: Record<string, string> | null;
  mapLat: number | null;
  mapLng: number | null;
}

export interface PublicProviderDetail {
  id: string;
  businessName: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  businessDescription: string | null;
  isFeatured: boolean;
  verificationStatus: string;
  showrooms: PublicProviderShowroom[];
  vehicles: (Pick<ListingVehicleCard, 'id' | 'slug' | 'title' | 'make' | 'model' | 'year' | 'pricePerDay' | 'transmission' | 'fuelType'> & {
    images: { url: string; altText: string | null }[];
  })[];
  _count: { vehicles: number };
}

export interface ProvidersListResponse {
  data: PublicProviderCard[];
  meta: PaginationMeta;
}

export const providersApi = {
  create: async (data: CreateProviderPayload) => {
    const res = await apiClient.post<ApiResponse<ProviderProfile>>('/providers', data);
    return res.data;
  },

  getMyProfile: async () => {
    const res = await apiClient.get<ApiResponse<ProviderProfileWithMeta | null>>('/providers/me');
    return res.data;
  },

  update: async (data: UpdateProviderPayload) => {
    const res = await apiClient.patch<ApiResponse<ProviderProfile>>('/providers/me', data);
    return res.data;
  },

  submitForReview: async () => {
    const res = await apiClient.post<ApiResponse<ProviderProfile>>('/providers/me/submit-for-review');
    return res.data;
  },

  getPublicProfile: async (slug: string) => {
    const res = await apiClient.get<ApiResponse<ProviderProfile>>(`/providers/${slug}`);
    return res.data;
  },

  // Showrooms
  createShowroom: async (data: CreateShowroomPayload) => {
    const res = await apiClient.post<ApiResponse<Showroom>>('/providers/me/showrooms', data);
    return res.data;
  },

  getShowrooms: async () => {
    const res = await apiClient.get<ApiResponse<Showroom[]>>('/providers/me/showrooms');
    return res.data;
  },

  updateShowroom: async (showroomId: string, data: Partial<CreateShowroomPayload>) => {
    const res = await apiClient.patch<ApiResponse<Showroom>>(
      `/providers/me/showrooms/${showroomId}`,
      data,
    );
    return res.data;
  },

  deleteShowroom: async (showroomId: string) => {
    await apiClient.delete(`/providers/me/showrooms/${showroomId}`);
  },

  // Public directory
  getAllPublic: async (page = 1, limit = 12, city?: string): Promise<ProvidersListResponse> => {
    const res = await apiClient.get<ApiResponse<PublicProviderCard[]>>('/providers', {
      params: { page, limit, city: city || undefined },
    });
    return { data: res.data.data, meta: res.data.meta as PaginationMeta };
  },

  getPublicBySlug: async (slug: string): Promise<PublicProviderDetail> => {
    const res = await apiClient.get<ApiResponse<PublicProviderDetail>>(`/providers/${slug}`);
    return res.data.data;
  },
};
