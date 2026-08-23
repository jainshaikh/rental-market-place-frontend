// Mirrors backend enums exactly — keep in sync with prisma/schema.prisma

export enum Role {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum ProviderStatus {
  PENDING = 'PENDING',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum VehicleStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

// The markets this platform actually operates in, running in parallel —
// see lib/config/markets.ts for currency/phone/city metadata per code.
export enum Market {
  PK = 'PK',
  SA = 'SA',
  AE = 'AE',
}

export enum BookingRequestStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Transmission {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
  CVT = 'CVT',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  CNG = 'CNG',
}
