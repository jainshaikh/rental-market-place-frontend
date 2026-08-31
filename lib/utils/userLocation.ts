import Cookies from 'js-cookie';

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

export const USER_LOCATION_COOKIE = 'userLocation';

// Matches the backend's default when radiusKm is omitted (listings.service.ts,
// providers.service.ts) — sent explicitly here so it's visible/adjustable
// from one place on the frontend rather than relying on the server default.
export const DEFAULT_NEARBY_RADIUS_KM = 25;

// Pure parser, no browser API dependency — usable from both the client (fed
// the js-cookie value below) and Server Components (fed `cookies().get(...)`).
//
// js-cookie percent-encodes the value on write (`"` -> `%22`, etc.) and
// decodes transparently when read back via `Cookies.get()` — but Next's raw
// `cookies().get(name)?.value` in Server Components returns the still-encoded
// string as sent over the wire, so it must be decoded here first.
export function parseUserLocation(raw: string | undefined | null): UserLocation | null {
  if (!raw) return null;
  try {
    const decoded = raw.startsWith('{') ? raw : decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number' && typeof parsed?.label === 'string') {
      return parsed as UserLocation;
    }
  } catch {
    // Malformed cookie (e.g. edited by hand) — treat as absent.
  }
  return null;
}

export function getUserLocation(): UserLocation | null {
  return parseUserLocation(Cookies.get(USER_LOCATION_COOKIE));
}

export function setUserLocation(location: UserLocation): void {
  Cookies.set(USER_LOCATION_COOKIE, JSON.stringify(location), { expires: 365, sameSite: 'lax' });
}

export function clearUserLocation(): void {
  Cookies.remove(USER_LOCATION_COOKIE);
}
