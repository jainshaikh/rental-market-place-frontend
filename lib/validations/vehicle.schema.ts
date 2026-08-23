import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  make: z.string().min(2, 'Make is required').max(50),
  model: z.string().min(1, 'Model is required').max(50),
  year: z
    .number({ invalid_type_error: 'Year must be a number' })
    .int()
    .min(1990, 'Year must be 1990 or later')
    .max(currentYear + 2, `Year cannot exceed ${currentYear + 2}`),
  transmission: z.enum(['AUTOMATIC', 'MANUAL', 'CVT'], {
    required_error: 'Select a transmission type',
  }),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'], {
    required_error: 'Select a fuel type',
  }),
  seatingCapacity: z
    .number({ invalid_type_error: 'Seating capacity must be a number' })
    .int()
    .min(1, 'Minimum 1 seat')
    .max(20, 'Maximum 20 seats'),
  engineType: z.string().max(60).optional().or(z.literal('')),
  pricePerDay: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(1, 'Price per day is required'),
  pricePerWeek: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(1)
    .optional()
    .or(z.literal(0).transform(() => undefined)),
  availabilityNotes: z.string().max(500).optional().or(z.literal('')),
  pricingNotes: z.string().max(500).optional().or(z.literal('')),
  specialConditions: z.string().max(1000).optional().or(z.literal('')),
  features: z.array(z.string().max(80)).optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

export const TRANSMISSION_OPTIONS = [
  { value: 'AUTOMATIC', label: 'Automatic' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'CVT', label: 'CVT' },
] as const;

export const FUEL_TYPE_OPTIONS = [
  { value: 'PETROL', label: 'Petrol' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'CNG', label: 'CNG' },
] as const;

export const COMMON_FEATURES = [
  'Air Conditioning',
  'GPS Navigation',
  'Bluetooth',
  'USB Charging',
  'Backup Camera',
  'Cruise Control',
  'Sunroof',
  'Leather Seats',
  'Heated Seats',
  'Child Seat',
  'Parking Sensors',
  'Lane Assist',
  'Apple CarPlay',
  'Android Auto',
  'Roof Rack',
  '4x4 / AWD',
] as const;
