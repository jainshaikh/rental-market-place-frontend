import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication — any matching prefix triggers auth check
const PROTECTED_ROUTES = ['/dashboard', '/provider/', '/admin'];

// Routes only accessible to unauthenticated users — redirect logged-in users away
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Role-to-route mapping — wrong role gets redirected to their correct dashboard
const ROLE_ROUTES: Record<string, string[]> = {
  USER: ['/dashboard'],
  PROVIDER: ['/provider/'],
  ADMIN: ['/admin'],
  SUPER_ADMIN: ['/admin'],
};

const ROLE_DASHBOARDS: Record<string, string> = {
  USER: '/dashboard',
  PROVIDER: '/provider/dashboard',
  ADMIN: '/admin/dashboard',
  SUPER_ADMIN: '/admin/dashboard',
};

/**
 * Middleware runs at the edge before any page renders.
 * It reads the user role from sessionStorage via a custom header set by the client,
 * OR relies on the presence of the refreshToken cookie as the auth signal.
 *
 * Strategy:
 * - We cannot verify JWTs in edge middleware without the full crypto stack
 * - Instead: presence of 'refreshToken' cookie = treat as authenticated
 * - Role information is stored in a client-readable cookie (not HTTP-only) set at login
 * - JwtAuthGuard on the API server validates all actual API calls
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session signals.
  // refreshToken is an HTTP-only cookie from the backend (localhost:3001) — it is NOT
  // visible here because middleware runs on localhost:3000. We rely on userRole, which
  // is a non-HTTP-only cookie set by the client at login time on this origin.
  const userRoleCookie = request.cookies.get('userRole');

  const isAuthenticated = !!userRoleCookie;
  const userRole = userRoleCookie?.value || null;

  // ── Redirect authenticated users away from auth pages ─────────────────────
  if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const dashboardUrl = userRole ? ROLE_DASHBOARDS[userRole] : '/dashboard';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // ── Protect dashboard/provider/admin routes ───────────────────────────────
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    if (userRole) {
      const allowedPrefixes = ROLE_ROUTES[userRole] || [];
      const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (!isAllowed) {
        // User is authenticated but accessing wrong role's area → redirect to their dashboard
        const correctDashboard = ROLE_DASHBOARDS[userRole] || '/dashboard';
        return NextResponse.redirect(new URL(correctDashboard, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on these paths only — skip static files, API routes, Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)',
  ],
};
