'use client';

import { useCallback, useEffect } from 'react';
import { Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsProvider } from './GoogleMapsProvider';
import { PlaceAutocompleteInput, type PlaceLocation } from './PlaceAutocompleteInput';
import { geoApi } from '../../lib/api/geo.api';

interface MapLocationPickerProps {
  addressValue: string;
  onAddressChange: (text: string) => void;
  lat?: number;
  lng?: number;
  onLocationChange: (lat: number, lng: number) => void;
  placeholder?: string;
  inputClassName?: string;
  inputId?: string;
}

// Pakistan's rough centroid — just an initial view before any location is
// picked; never shown as a "your location is here" claim.
const DEFAULT_CENTER = { lat: 30.3753, lng: 69.3451 };
const DEFAULT_ZOOM = 5;
const PICKED_ZOOM = 16;

function FlyToPin({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (map && lat !== undefined && lng !== undefined) {
      map.panTo({ lat, lng });
      map.setZoom(PICKED_ZOOM);
    }
  }, [map, lat, lng]);
  return null;
}

// General-purpose address + map picker: Places Autocomplete is the primary
// way to set a location, with the map (search result recentres it, click or
// drag the pin fine-tunes it) as a fallback/confirmation step — never a
// required action on its own. Used anywhere a precise lat/lng needs to be
// captured alongside a human-readable address (provider showroom, trip
// pickup/dropoff, etc).
export function MapLocationPicker({
  addressValue,
  onAddressChange,
  lat,
  lng,
  onLocationChange,
  placeholder,
  inputClassName,
  inputId,
}: MapLocationPickerProps) {
  const hasPin = lat !== undefined && lng !== undefined;

  const handlePlaceSelected = useCallback(
    (place: PlaceLocation) => {
      onAddressChange(place.formattedAddress);
      onLocationChange(place.lat, place.lng);
    },
    [onAddressChange, onLocationChange],
  );

  // A raw map click/drag only gives coordinates — Places Autocomplete gets
  // its address for free from the place details, but dropping a pin
  // directly needs a reverse-geocode call to fill the text field the same
  // way. The coordinates themselves are set immediately either way; this
  // is a best-effort label fill-in on top, not something the pin depends on.
  const handleMapInteraction = useCallback(
    (newLat: number, newLng: number) => {
      onLocationChange(newLat, newLng);
      geoApi
        .reverseGeocode(newLat, newLng)
        .then((result) => onAddressChange(result.formattedAddress || result.label))
        .catch(() => {});
    },
    [onLocationChange, onAddressChange],
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) handleMapInteraction(e.latLng.lat(), e.latLng.lng());
    },
    [handleMapInteraction],
  );

  return (
    <GoogleMapsProvider>
      <div className="space-y-2">
        <PlaceAutocompleteInput
          id={inputId}
          value={addressValue}
          onValueChange={onAddressChange}
          onPlaceSelected={handlePlaceSelected}
          placeholder={placeholder}
          className={inputClassName}
          regionCodes={['PK', 'AE', 'SA']}
        />
        <div className="h-56 w-full overflow-hidden rounded-lg border border-slate-300">
          <Map
            defaultCenter={hasPin ? { lat, lng } : DEFAULT_CENTER}
            defaultZoom={hasPin ? PICKED_ZOOM : DEFAULT_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={false}
            onClick={(e) => {
              const pos = e.detail.latLng;
              if (pos) handleMapInteraction(pos.lat, pos.lng);
            }}
          >
            <FlyToPin lat={lat} lng={lng} />
            {hasPin && <Marker position={{ lat, lng }} draggable onDragEnd={handleMarkerDragEnd} />}
          </Map>
        </div>
        <p className="text-xs text-slate-500">
          {hasPin
            ? 'Drag the pin or click the map to fine-tune the exact spot.'
            : 'Search your address above, or click the map to drop a pin.'}
        </p>
      </div>
    </GoogleMapsProvider>
  );
}
