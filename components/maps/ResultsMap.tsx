'use client';

import { Map, Marker, Circle } from '@vis.gl/react-google-maps';
import { GoogleMapsProvider } from './GoogleMapsProvider';

export interface ResultsMapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

interface ResultsMapProps {
  center: { lat: number; lng: number };
  radiusKm: number;
  pins: ResultsMapPin[];
  className?: string;
}

function zoomForRadius(radiusKm: number): number {
  if (radiusKm <= 10) return 12;
  if (radiusKm <= 25) return 11;
  if (radiusKm <= 50) return 10;
  return 9;
}

// A plain classic Marker (not AdvancedMarker) — no Google Cloud "Map ID" setup
// required, unlike Advanced Markers. Re-keyed on the center so the map fully
// remounts (fresh camera) whenever the user's location changes, rather than
// fighting the uncontrolled defaultCenter/defaultZoom props.
export function ResultsMap({ center, radiusKm, pins, className }: ResultsMapProps) {
  return (
    <GoogleMapsProvider>
      <div className={className}>
        <Map
          key={`${center.lat}-${center.lng}-${radiusKm}`}
          defaultCenter={center}
          defaultZoom={zoomForRadius(radiusKm)}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          <Marker
            position={center}
            title="Your location"
            icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
            zIndex={1000}
          />
          <Circle
            center={center}
            radius={radiusKm * 1000}
            strokeColor="#2563eb"
            strokeOpacity={0.35}
            strokeWeight={1}
            fillColor="#2563eb"
            fillOpacity={0.06}
          />
          {pins.map((pin) => (
            <Marker key={pin.id} position={{ lat: pin.lat, lng: pin.lng }} title={pin.label} />
          ))}
        </Map>
      </div>
    </GoogleMapsProvider>
  );
}
