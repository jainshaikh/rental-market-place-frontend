import { z } from 'zod';

export const tripSchema = z.object({
  userVehicleId: z.string().min(1, 'Select a vehicle'),
  originCity: z.string().min(2, 'Origin city is required').max(100),
  destinationCity: z.string().min(2, 'Destination city is required').max(100),
  pickupPoint: z.string().min(3, 'Pickup point is required').max(300),
  dropoffPoint: z.string().max(300).optional().or(z.literal('')),
  departureAt: z
    .string()
    .min(1, 'Select a departure date & time')
    .refine((val) => new Date(val).getTime() > Date.now(), 'Departure must be in the future'),
  availableSeats: z
    .number({ invalid_type_error: 'Seats must be a number' })
    .int()
    .min(1, 'At least 1 seat')
    .max(20, 'Maximum 20 seats'),
  pricePerSeat: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(1, 'Price per seat is required'),
  contactNumber: z.string().min(6, 'Contact number is required').max(20),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type TripFormValues = z.infer<typeof tripSchema>;
