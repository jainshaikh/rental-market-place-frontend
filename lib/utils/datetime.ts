// Trips only ever run within Pakistan, and Pakistan has no DST — so instead
// of letting `Intl`/`Date` fall back to the ambient locale/runtime timezone
// (which differs between a server-rendered page and a client-rendered one,
// and between viewers in different timezones), every trip date/time is
// pinned to this fixed zone. That's what was producing "different time in
// listing vs. what I booked": the same UTC instant rendered through whatever
// timezone happened to be active wherever the render occurred.
export const TRIP_TIMEZONE = 'Asia/Karachi';
const TRIP_UTC_OFFSET = '+05:00';

export function formatTripDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' },
): string {
  return new Date(iso).toLocaleDateString('en-PK', { ...options, timeZone: TRIP_TIMEZONE });
}

export function formatTripTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-PK', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TRIP_TIMEZONE,
  });
}

export function formatTripDateTime(
  iso: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  return new Date(iso).toLocaleString('en-PK', { ...options, timeZone: TRIP_TIMEZONE });
}

// "2h 15m" / "45m" style, for a driving duration in minutes.
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Estimated dropoff instant = departure + driving duration. Best-effort only
// (no live traffic) — always label it "estimated arrival" in the UI.
export function estimateArrival(departureAtIso: string, durationMinutes: number): Date {
  return new Date(new Date(departureAtIso).getTime() + durationMinutes * 60_000);
}

// The `datetime-local` input gives a bare "YYYY-MM-DDTHH:mm" string with no
// timezone. Historically this app fed that straight into `new Date(...)`,
// which interprets it in the *browser's* local timezone — correct only when
// the poster's device happens to be set to Pakistan time. Since every trip
// is in Pakistan, pin the interpretation to Asia/Karachi explicitly instead,
// so the stored instant is correct regardless of the poster's device.
export function karachiLocalToISOString(datetimeLocalValue: string): string {
  return new Date(`${datetimeLocalValue}:00${TRIP_UTC_OFFSET}`).toISOString();
}
