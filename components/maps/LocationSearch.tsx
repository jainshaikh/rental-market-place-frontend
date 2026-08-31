'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LocateFixed, Loader2, X } from 'lucide-react';
import { GoogleMapsProvider } from './GoogleMapsProvider';
import { PlaceAutocompleteInput, type PlaceLocation } from './PlaceAutocompleteInput';
import { getCurrentCoords } from '../../lib/utils/geolocation';
import { getUserLocation, setUserLocation, clearUserLocation, type UserLocation } from '../../lib/utils/userLocation';
import { geoApi } from '../../lib/api/geo.api';
import { cn } from '../../lib/utils/cn';

interface LocationSearchProps {
  /** Called whenever the resolved location changes — set on pick/geolocate, null on clear. */
  onLocationChange?: (location: UserLocation | null) => void;
  className?: string;
}

// A single always-active control, styled like the other filter inputs: a
// locate-me icon button, a Places Autocomplete text field the visitor can
// type into directly (no extra click to "activate" it first), and a clear
// button once it holds a value. Captures + persists the resolved location
// (via the browser's own geolocation, or the typed search) into the
// `userLocation` cookie — actually applying that to filter/sort results is a
// separate concern, handled by whichever view reads the cookie/callback.
export function LocationSearch({ onLocationChange, className }: LocationSearchProps) {
  const router = useRouter();
  const [current, setCurrent] = useState<UserLocation | null>(null);
  const [inputText, setInputText] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const loc = getUserLocation();
    setCurrent(loc);
    if (loc) setInputText(loc.label);
  }, []);

  const applyLocation = (location: UserLocation) => {
    setUserLocation(location);
    setCurrent(location);
    setInputText(location.label);
    onLocationChange?.(location);
    toast.success(`Showing results near ${location.label}`);
    // Re-runs server components on this page (e.g. a page's SSR-fetched
    // initial data) with the fresh cookie value. Harmless where a parent
    // already refetches client-side off the onLocationChange callback.
    router.refresh();
  };

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const coords = await getCurrentCoords();
      const result = await geoApi.reverseGeocode(coords.lat, coords.lng);
      applyLocation({ lat: coords.lat, lng: coords.lng, label: result.label });
    } catch {
      toast.error('Could not get your location — check your browser permissions, or type an area below.');
    } finally {
      setLocating(false);
    }
  };

  const handlePlaceSelected = (place: PlaceLocation) => {
    applyLocation({ lat: place.lat, lng: place.lng, label: place.description });
  };

  const handleClear = () => {
    clearUserLocation();
    setCurrent(null);
    setInputText('');
    onLocationChange?.(null);
    router.refresh();
  };

  return (
    <GoogleMapsProvider>
      <div
        className={cn(
          'flex items-center gap-1 rounded-control border border-border-strong bg-surface pl-1 pr-1.5 transition-shadow focus-within:border-brand-600 focus-within:ring-[3px] focus-within:ring-brand-600/18',
          className,
        )}
      >
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          title="Use my location"
          aria-label="Use my location"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-media text-text-muted transition-colors hover:bg-surface-hover hover:text-brand-700 disabled:opacity-60"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </button>

        <PlaceAutocompleteInput
          value={inputText}
          onValueChange={setInputText}
          onPlaceSelected={handlePlaceSelected}
          placeholder="Search by area…"
          regionCodes={['PK', 'AE', 'SA']}
          className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-text-faint outline-none"
        />

        {(inputText || current) && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear location"
            aria-label="Clear location"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-media text-text-faint transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </GoogleMapsProvider>
  );
}
