import Cookies from 'js-cookie';

// Shared with hooks/useAuth.ts and the verify-email page — both need to read/write
// these same two cookies (userRole, emailVerified) with identical options, since
// middleware.ts (edge, no DB/JWT access) relies on them as its sole auth signals.
export const AUTH_COOKIE_OPTIONS = {
  expires: 7,
  sameSite: 'strict' as const,
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
};

export function setAuthCookies(role: string, emailVerified: boolean) {
  Cookies.set('userRole', role, AUTH_COOKIE_OPTIONS);
  Cookies.set('emailVerified', String(emailVerified), AUTH_COOKIE_OPTIONS);
}

export function setEmailVerifiedCookie(verified: boolean) {
  Cookies.set('emailVerified', String(verified), AUTH_COOKIE_OPTIONS);
}

export function clearAuthCookies() {
  Cookies.remove('userRole');
  Cookies.remove('emailVerified');
}
