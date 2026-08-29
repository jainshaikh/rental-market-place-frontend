// Thin wrapper around gtag's event call. Safe to call from anywhere,
// including before GA has finished loading (afterInteractive) or when
// NEXT_PUBLIC_GA_ID isn't set (local dev) — it just no-ops.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
