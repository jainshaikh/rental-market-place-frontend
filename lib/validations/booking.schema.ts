import { z } from 'zod';

export const createBookingSchema = z.object({
  vehicleId: z.string().min(1),
  requestedFromDate: z.string().min(1, 'Pick-up date & time is required'),
  durationType: z.enum(['HOURS_6', 'HOURS_12', 'DAY', 'WEEK', 'MONTH'], {
    required_error: 'Select a rental duration',
  }),
  durationQuantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int()
    .min(1, 'Minimum 1'),
  pickupLocation: z.string().max(200).optional().or(z.literal('')),
  message: z.string().max(1000).optional().or(z.literal('')),
});

export type CreateBookingFormValues = z.infer<typeof createBookingSchema>;
