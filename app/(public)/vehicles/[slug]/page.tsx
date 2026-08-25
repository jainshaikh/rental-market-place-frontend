import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  BadgeCheck,
  Calendar,
  ChevronRight,
  Eye,
  Fuel,
  Image as ImageIcon,
  MapPin,
  Settings2,
  Users,
} from 'lucide-react';
import { fetchVehicleBySlug } from '../../../../lib/api/server';
import type { ListingVehicleDetail } from '../../../../lib/api/listings.api';
import { getCurrencyCode } from '../../../../lib/utils/currency';
import { getAvailableDurations, getUnitPrice } from '../../../../lib/utils/rentalDuration';
import { Card } from '../../../../components/ui';
import { RatingSummaryBadge } from '../../../../components/common/RatingSummaryBadge';
import { ReviewsList } from '../../../../components/common/ReviewsList';
import { InquiryCta } from '../../../../components/vehicles/InquiryCta';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const res = await fetchVehicleBySlug(params.slug);
  if (!res?.data) return { title: 'Vehicle Not Found — KerayeGo' };

  const v = res.data;
  const price = Number(v.pricePerDay).toLocaleString();
  const currency = getCurrencyCode(v.showroom?.country);
  const location = v.showroom?.city ?? v.locationText ?? null;

  return {
    title: `${v.title} — ${currency} ${price}/day | KerayeGo`,
    description: [
      v.title,
      `${v.year} · ${v.transmission} · ${v.fuelType}`,
      location ? `For rent in ${location}` : null,
      `From ${currency} ${price} per day`,
    ]
      .filter(Boolean)
      .join(' · '),
    keywords: [
      `${v.make} ${v.model} for rent`,
      location ? `car rental ${location}` : null,
      location ? `${v.make} for rent in ${location}` : null,
      `rent ${v.make} ${v.model}`,
    ].filter((k): k is string => !!k),
    alternates: {
      canonical: `/vehicles/${v.slug}`,
    },
    openGraph: {
      title: v.title,
      description: `Rent the ${v.title} for ${currency} ${price}/day from ${v.providerProfile.businessName}`,
      images: v.images[0]?.url ? [{ url: v.images[0].url, alt: v.title }] : [],
    },
  };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const res = await fetchVehicleBySlug(params.slug);
  if (!res?.data) notFound();

  const vehicle = res.data as ListingVehicleDetail;
  const price = Number(vehicle.pricePerDay).toLocaleString();
  const currency = getCurrencyCode(vehicle.showroom?.country);
  const availableDurations = getAvailableDurations(vehicle);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: vehicle.title,
    description: `${vehicle.year} ${vehicle.make} ${vehicle.model} — ${vehicle.transmission}, ${vehicle.fuelType}, ${vehicle.seatingCapacity} seats.`,
    image: vehicle.images.map((img) => img.url),
    brand: { '@type': 'Brand', name: vehicle.make },
    offers: {
      '@type': 'Offer',
      businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
      price: vehicle.pricePerDay,
      priceCurrency: currency,
      availability:
        vehicle.availability === 'AVAILABLE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: vehicle.providerProfile.businessName },
      areaServed: vehicle.showroom?.city ?? undefined,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-xs text-text-muted">
        <Link href="/vehicles" className="hover:text-slate-700">
          Vehicles
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-border-strong" />
        <span className="truncate font-semibold text-ink">{vehicle.title}</span>
      </nav>

      {vehicle.availability === 'BOOKED' && (
        <div className="mb-6 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This vehicle is currently out on a rental.
          {vehicle.bookedUntil &&
            ` Available again from ${new Date(vehicle.bookedUntil).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.`}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — images + details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image gallery */}
          <ImageGallery images={vehicle.images} title={vehicle.title} />

          {/* Title + quick specs */}
          <div>
            <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink">
              {vehicle.title}
            </h1>
            <div className="mt-3.5 flex flex-wrap items-center gap-3.5 text-[13px] text-text-muted">
              <RatingSummaryBadge subjectType="VEHICLE" subjectId={vehicle.id} size="sm" />
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {vehicle.showroom?.city ?? vehicle.locationText ?? '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {vehicle.viewCount} views
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <SpecTile
                icon={Settings2}
                label="Transmission"
                value={titleCase(vehicle.transmission)}
              />
              <SpecTile icon={Fuel} label="Fuel" value={titleCase(vehicle.fuelType)} />
              <SpecTile icon={Users} label="Seats" value={String(vehicle.seatingCapacity)} />
              <SpecTile icon={Calendar} label="Year" value={String(vehicle.year)} />
            </div>
          </div>

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-ink">Features &amp; amenities</h2>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((f) => (
                  <span
                    key={f.id}
                    className="rounded-chip bg-surface-hover px-3 py-1.5 text-sm text-slate-700"
                  >
                    {f.name}
                    {f.value && <span className="text-text-faint"> · {f.value}</span>}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {(vehicle.availabilityNotes || vehicle.pricingNotes || vehicle.specialConditions) && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-ink">Rental details</h2>
              {vehicle.availabilityNotes && (
                <InfoBlock title="Availability" body={vehicle.availabilityNotes} />
              )}
              {vehicle.pricingNotes && (
                <InfoBlock title="Pricing notes" body={vehicle.pricingNotes} />
              )}
              {vehicle.specialConditions && (
                <InfoBlock title="Special conditions" body={vehicle.specialConditions} />
              )}
            </section>
          )}

          {/* Provider */}
          <Card>
            <h2 className="mb-3 text-base font-semibold text-ink">Provider</h2>
            <Link
              href={`/providers/${vehicle.providerProfile.slug}`}
              className="group flex items-center gap-3.5"
            >
              {vehicle.providerProfile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={vehicle.providerProfile.logoUrl}
                  alt={vehicle.providerProfile.businessName}
                  className="h-11 w-11 rounded-[11px] border border-border-subtle object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-ink text-[15px] font-semibold text-white">
                  {vehicle.providerProfile.businessName[0]}
                </div>
              )}
              <div>
                <p className="font-semibold text-ink transition-colors group-hover:text-brand-600">
                  {vehicle.providerProfile.businessName}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified provider — view all listings
                </p>
                <RatingSummaryBadge
                  subjectType="PROVIDER"
                  subjectId={vehicle.providerProfile.id}
                  size="sm"
                  className="mt-1"
                />
              </div>
            </Link>
          </Card>

          {/* Reviews */}
          <Card>
            <ReviewsList subjectType="VEHICLE" subjectId={vehicle.id} title="Vehicle reviews" />
          </Card>
        </div>

        {/* Right column — inquiry card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-3.5">
            {/* Price card */}
            <Card padding="lg" className="shadow-md">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-[26px] font-semibold tracking-tight text-ink">
                  {currency} {price}
                </span>
                <span className="text-[13px] text-text-muted">/ day</span>
              </div>

              {availableDurations.length > 1 && (
                <dl className="mt-3 space-y-1 border-t border-border-subtle pt-3">
                  {availableDurations
                    .filter((d) => d.value !== 'DAY')
                    .map((d) => (
                      <div key={d.value} className="flex items-center justify-between text-[13px]">
                        <dt className="text-text-muted">{d.label}</dt>
                        <dd className="font-mono font-medium text-ink">
                          {currency} {getUnitPrice(vehicle, d.value)!.toLocaleString()}
                        </dd>
                      </div>
                    ))}
                </dl>
              )}

              {/* Location */}
              {vehicle.showroom && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-text-muted" />
                  <span>
                    {vehicle.showroom.name}
                    {vehicle.showroom.area && `, ${vehicle.showroom.area}`}
                    {' — '}
                    {vehicle.showroom.city.charAt(0).toUpperCase() + vehicle.showroom.city.slice(1)}
                  </span>
                </div>
              )}

              {/* Contact CTA */}
              <div className="mt-5 space-y-2.5">
                <InquiryCta
                  vehicleSlug={vehicle.slug}
                  vehicleTitle={vehicle.title}
                  whatsappNumber={vehicle.showroom?.whatsappNumber}
                />

                <p className="text-center text-xs text-text-faint">
                  Free to inquire · No payment yet
                </p>
              </div>

              {/* Showroom contact */}
              {vehicle.showroom?.contactNumber && (
                <div className="mt-4 border-t border-border-subtle pt-4 text-center">
                  <p className="mb-1 text-xs text-text-faint">Or call the showroom</p>
                  <a
                    href={`tel:${vehicle.showroom.contactNumber}`}
                    className="text-sm font-medium text-slate-700 transition-colors hover:text-brand-600"
                  >
                    {vehicle.showroom.contactNumber}
                  </a>
                </div>
              )}
            </Card>

            {/* Stats */}
            <div className="flex gap-3.5 text-center">
              <Card className="flex-1 !p-3.5">
                <p className="font-mono text-xl font-semibold text-ink">{vehicle.viewCount}</p>
                <p className="text-xs text-text-faint">views</p>
              </Card>
              <Card className="flex-1 !p-3.5">
                <p className="font-mono text-xl font-semibold text-ink">{vehicle.inquiryCount}</p>
                <p className="text-xs text-text-faint">inquiries</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function SpecTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Settings2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-control border border-border-subtle bg-surface p-3.5">
      <Icon className="h-4 w-4 text-text-muted" />
      <div className="mb-1 mt-2.5 text-[11px] text-text-faint">{label}</div>
      <div className="text-[13px] font-semibold text-ink">{value}</div>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="mb-0.5 text-sm font-medium text-slate-700">{title}</p>
      <p className="text-sm text-text-muted">{body}</p>
    </div>
  );
}

function ImageGallery({
  images,
  title,
}: {
  images: ListingVehicleDetail['images'];
  title: string;
}) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-card bg-surface-hover text-text-faint">
        <ImageIcon className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {/* Primary image */}
      <div className="aspect-[16/10] overflow-hidden rounded-card bg-surface-hover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0].url}
          alt={images[0].altText ?? title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails (up to 4) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1, 5).map((img, idx) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-media bg-surface-hover"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText ?? `${title} photo ${idx + 2}`}
                className="h-full w-full object-cover"
              />
              {/* "More" overlay on last thumbnail if there are more images */}
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/55">
                  <span className="text-sm font-semibold text-white">+{images.length - 5}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
