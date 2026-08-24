import { Role, UserStatus, ProviderStatus, VehicleStatus, BookingRequestStatus, Transmission, FuelType, Market } from './enums';
export type { Transmission, FuelType };
export { Market };

// ─── API Response Envelope ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export interface ProviderProfile {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  businessDescription: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  verificationStatus: ProviderStatus;
  rejectionReason: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Showroom {
  id: string;
  providerProfileId: string;
  name: string;
  address: string;
  city: string;
  area: string | null;
  contactNumber: string;
  whatsappNumber: string | null;
  operatingHours: Record<string, string> | null;
  mapLat: number | null;
  mapLng: number | null;
  country: Market;
}

// ─── Vehicle ────────────────────────────────────────────────────────────────

export interface VehicleImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface VehicleImageFull extends VehicleImage {
  publicId: string;
  width: number | null;
  height: number | null;
}

export interface VehicleFeature {
  id: string;
  name: string;
  value: string | null;
}

// Full vehicle shape returned to the owning provider (includes publicId for deletion)
export interface ProviderVehicle {
  id: string;
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number;
  transmission: Transmission;
  fuelType: FuelType;
  seatingCapacity: number;
  engineType: string | null;
  pricePer6Hours: string | null;
  pricePer12Hours: string | null;
  pricePerDay: string;
  pricePerWeek: string | null;
  pricePerMonth: string | null;
  locationText: string | null;
  availabilityNotes: string | null;
  pricingNotes: string | null;
  specialConditions: string | null;
  status: VehicleStatus;
  rejectionReason: string | null;
  viewCount: number;
  inquiryCount: number;
  showroomId: string | null;
  images: VehicleImageFull[];
  features: VehicleFeature[];
  showroom: { id: string; name: string; city: string; area: string | null; contactNumber: string; country: Market } | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleCard {
  id: string;
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number;
  pricePer6Hours: string | null;
  pricePer12Hours: string | null;
  pricePerDay: string;
  pricePerWeek: string | null;
  pricePerMonth: string | null;
  transmission: Transmission;
  fuelType: FuelType;
  seatingCapacity: number;
  status: VehicleStatus;
  images: Pick<VehicleImage, 'url' | 'altText'>[];
  providerProfile: {
    businessName: string;
    slug: string;
  };
  showroom: {
    city: string;
    country: Market;
  } | null;
}

export interface VehicleDetail extends VehicleCard {
  engineType: string | null;
  locationText: string | null;
  availabilityNotes: string | null;
  pricingNotes: string | null;
  specialConditions: string | null;
  features: VehicleFeature[];
  viewCount: number;
}

// ─── Booking Requests ───────────────────────────────────────────────────────

export interface BookingRequest {
  id: string;
  vehicleId: string;
  providerProfileId: string;
  requestedFromDate: string;
  requestedToDate: string;
  pickupLocation: string | null;
  message: string | null;
  status: BookingRequestStatus;
  createdAt: string;
  updatedAt: string;
  vehicle: Pick<VehicleCard, 'id' | 'title' | 'slug' | 'images'>;
  providerProfile: Pick<ProviderProfile, 'id' | 'businessName' | 'slug'>;
}

export interface BookingStatusHistory {
  id: string;
  oldStatus: BookingRequestStatus;
  newStatus: BookingRequestStatus;
  changedByUserId: string;
  note: string | null;
  createdAt: string;
}

// ─── Saved Vehicles ─────────────────────────────────────────────────────────

export interface SavedVehicle {
  id: string;
  vehicleId: string;
  createdAt: string;
  vehicle: VehicleCard;
}
