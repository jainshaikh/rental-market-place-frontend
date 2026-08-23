import { z } from 'zod';

export const createBookingSchema = z
  .object({
    vehicleId: z.string().min(1),
    requestedFromDate: z.string().min(1, 'Pick-up date & time is required'),
    requestedToDate: z.string().min(1, 'Return date & time is required'),
    pickupLocation: z.string().max(200).optional().or(z.literal('')),
    message: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.requestedFromDate || !data.requestedToDate) return true;
      return new Date(data.requestedToDate) > new Date(data.requestedFromDate);
    },
    { message: 'Return date must be after pick-up date', path: ['requestedToDate'] },
  );

export type CreateBookingFormValues = z.infer<typeof createBookingSchema>;
