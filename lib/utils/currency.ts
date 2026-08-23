import { Market } from '../../types/api.types';
import { MARKETS, DEFAULT_MARKET } from '../config/markets';

// Resolves the currency to display for a listing/trip from the `country` on
// its linked showroom/user-vehicle. Falls back to the platform default (PK)
// for any pre-migration record that predates the Market concept.
export function getCurrencyCode(country?: Market | null): string {
  return MARKETS[country ?? DEFAULT_MARKET].currencyCode;
}

// Convenience for the common `"PKR 8,000"` rendering — matches the
// `Number(x).toLocaleString()` formatting already used throughout the app.
export function formatAmount(amount: number | string, country?: Market | null): string {
  return `${getCurrencyCode(country)} ${Number(amount).toLocaleString()}`;
}
