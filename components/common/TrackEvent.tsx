'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '../../lib/utils/analytics';

interface TrackEventProps {
  name: string;
  params?: Record<string, unknown>;
}

// Drop into a server-rendered page to fire a one-time GA4 event on mount —
// e.g. `view_vehicle` on a vehicle detail page. Renders nothing.
export function TrackEvent({ name, params }: TrackEventProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(name, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
