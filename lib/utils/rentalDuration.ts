export type RentalDurationType = 'HOURS_6' | 'HOURS_12' | 'DAY' | 'WEEK' | 'MONTH';

export interface VehicleRentalPrices {
  pricePer6Hours?: string | number | null;
  pricePer12Hours?: string | number | null;
  pricePerDay: string | number;
  pricePerWeek?: string | number | null;
  pricePerMonth?: string | number | null;
}

export const RENTAL_DURATION_OPTIONS: { value: RentalDurationType; label: string; unitLabel: string }[] = [
  { value: 'HOURS_6', label: '6 Hours', unitLabel: '6-hour block' },
  { value: 'HOURS_12', label: '12 Hours', unitLabel: '12-hour block' },
  { value: 'DAY', label: 'Day', unitLabel: 'day' },
  { value: 'WEEK', label: 'Week', unitLabel: 'week' },
  { value: 'MONTH', label: 'Month', unitLabel: 'month' },
];

/** Null when the provider hasn't priced that duration for this vehicle. */
export function getUnitPrice(vehicle: VehicleRentalPrices, type: RentalDurationType): number | null {
  const raw = {
    HOURS_6: vehicle.pricePer6Hours,
    HOURS_12: vehicle.pricePer12Hours,
    DAY: vehicle.pricePerDay,
    WEEK: vehicle.pricePerWeek,
    MONTH: vehicle.pricePerMonth,
  }[type];
  return raw === null || raw === undefined ? null : Number(raw);
}

/** Duration types this vehicle actually has a price for, in display order. */
export function getAvailableDurations(vehicle: VehicleRentalPrices) {
  return RENTAL_DURATION_OPTIONS.filter((opt) => getUnitPrice(vehicle, opt.value) !== null);
}

// Client-side preview only — the backend independently recomputes this from
// the same inputs and is the source of truth for what's actually booked.
// Weeks are always exactly 7 days; months use calendar-month addition (same
// day next month) since a fixed day count would drift against what a rental
// agreement actually means.
export function computeReturnDate(from: Date, type: RentalDurationType, quantity: number): Date {
  const result = new Date(from);
  switch (type) {
    case 'HOURS_6':
      result.setHours(result.getHours() + 6 * quantity);
      return result;
    case 'HOURS_12':
      result.setHours(result.getHours() + 12 * quantity);
      return result;
    case 'DAY':
      result.setDate(result.getDate() + quantity);
      return result;
    case 'WEEK':
      result.setDate(result.getDate() + 7 * quantity);
      return result;
    case 'MONTH':
      result.setMonth(result.getMonth() + quantity);
      return result;
  }
}

export function formatDurationLabel(type: RentalDurationType, quantity: number): string {
  const option = RENTAL_DURATION_OPTIONS.find((opt) => opt.value === type);
  const unit = option?.unitLabel ?? type;
  return `${quantity} ${unit}${quantity === 1 ? '' : 's'}`;
}
