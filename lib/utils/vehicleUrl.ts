// Builds a vehicle's canonical public URL: /rent-a-car/[city]/[make-model]/[slug].
// The city/make-model segments are cosmetic context, not a lookup key — the
// detail page always resolves the vehicle by `slug` alone, so an imprecise
// city here (e.g. no showroom city available, as in an authenticated
// dashboard context that only has the vehicle's make/model) degrades
// gracefully rather than breaking the link.
export function getVehicleUrl(
  vehicle: { slug: string; make: string; model: string },
  city?: string | null,
): string {
  const citySlug = (city ?? 'pakistan').toLowerCase().trim().replace(/\s+/g, '-');
  const makeModelSlug = `${vehicle.make} ${vehicle.model}`.toLowerCase().trim().replace(/\s+/g, '-');
  return `/rent-a-car/${encodeURIComponent(citySlug)}/${encodeURIComponent(makeModelSlug)}/${vehicle.slug}`;
}
