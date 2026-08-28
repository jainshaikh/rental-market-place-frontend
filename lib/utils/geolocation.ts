// Approximate city-centre coordinates for KerayeGo's supported Pakistani
// cities. Used only to map a browser geolocation result to the nearest known
// city — never displayed or sent anywhere, and not a source of truth for
// which cities are actually live (that's always the API's distinct-cities
// list; this table is just reference geography).
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  karachi: { lat: 24.8607, lng: 67.0011 },
  lahore: { lat: 31.5497, lng: 74.3436 },
  islamabad: { lat: 33.6844, lng: 73.0479 },
  rawalpindi: { lat: 33.5651, lng: 73.0169 },
  faisalabad: { lat: 31.4504, lng: 73.135 },
  multan: { lat: 30.1575, lng: 71.5249 },
  peshawar: { lat: 34.0151, lng: 71.5249 },
  hyderabad: { lat: 25.396, lng: 68.3578 },
  quetta: { lat: 30.1798, lng: 66.975 },
};

function haversineDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Given a coordinate and the list of cities actually live on the site (from
 * the API, not the reference table above), return the closest one. Cities
 * not in `availableCities` are never returned, even if geographically
 * closer — no point pointing someone at a city with no listings.
 */
export function nearestCity(
  coords: { lat: number; lng: number },
  availableCities: string[],
): string | null {
  let closest: string | null = null;
  let closestDistance = Infinity;

  for (const city of availableCities) {
    const ref = CITY_COORDINATES[city.toLowerCase()];
    if (!ref) continue;
    const distance = haversineDistanceKm(coords, ref);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = city.toLowerCase();
    }
  }

  return closest;
}

export function getCurrentCoords(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => reject(error),
      { timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
