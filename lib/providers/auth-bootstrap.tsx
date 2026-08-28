'use client';

import { useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { setAccessToken } from '../api/client';
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
export function AuthBootstrap() {
  useEffect(() => {
    if (!useAuthStore.getState().isAuthenticated) return;

    authApi
      .refresh()
      .then(({ data }) => setAccessToken(data.accessToken))
      .catch(() => {});
  }, []);

  return null;
}
