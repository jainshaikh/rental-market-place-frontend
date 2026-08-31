'use client';

import type { ReactNode } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_BROWSER_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY ?? '';

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  return <APIProvider apiKey={GOOGLE_MAPS_BROWSER_KEY}>{children}</APIProvider>;
}
