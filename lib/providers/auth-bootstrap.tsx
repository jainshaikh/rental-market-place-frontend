'use client';

import { useEffect } from 'react';
import { refreshAccessToken } from '../api/client';
import { useAuthStore } from '../../store/auth.store';

// The in-memory access token (client.ts) is wiped on every hard reload, but
// sessionStorage still remembers `isAuthenticated`/`user` from before the
// reload. Without this, the first authenticated request after a reload has
// to 401 before the response interceptor's reactive refresh kicks in —
// this fires the same refresh proactively, in the background, so a valid
// session is restored before anything needs to fail first. A failure here
// is left for the reactive interceptor to handle; it's not treated as a
// logout on its own, since an anonymous visitor hits this same path once
// per load with no session to restore.
//
// Goes through the shared refreshAccessToken() (not a direct authApi.refresh()
// call) so this coalesces with any other refresh already in flight — e.g.
// React StrictMode double-invokes this effect in dev, and without sharing a
// single promise, both invocations would present the same not-yet-rotated
// refresh token and the backend's rotation would treat the second one as a
// replay, killing the whole session on every single page load.
export function AuthBootstrap() {
  useEffect(() => {
    if (!useAuthStore.getState().isAuthenticated) return;
    refreshAccessToken().catch(() => {});
  }, []);

  return null;
}
