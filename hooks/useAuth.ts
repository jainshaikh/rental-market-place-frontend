'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../lib/api/auth.api';
import type { AuthUser } from '../types/api.types';
import type { LoginFormValues } from '../lib/validations/auth.schema';
import type { RegisterFormValues } from '../lib/validations/auth.schema';
import { Role } from '../types/enums';

const COOKIE_OPTIONS = {
  expires: 7,
  sameSite: 'strict' as const,
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
};

function roleToRoute(role: string): string {
  if (role === Role.ADMIN || role === Role.SUPER_ADMIN) return '/admin/dashboard';
  if (role === Role.PROVIDER) return '/provider/dashboard';
  return '/dashboard';
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    async (data: LoginFormValues) => {
      const response = await authApi.login(data);
      const { accessToken, user: authUser } = response.data;
      setAuth(authUser, accessToken);
      // userRole cookie is readable by Next.js middleware (same origin) — used for RBAC redirects
      Cookies.set('userRole', authUser.role, COOKIE_OPTIONS);
      return authUser;
    },
    [setAuth],
  );

  const register = useCallback(
    async (data: Omit<RegisterFormValues, 'confirmPassword'>) => {
      return authApi.register(data);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      Cookies.remove('userRole');
      router.push('/');
    }
  }, [clearAuth, router]);

  const isAdmin = user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN;
  const isProvider = user?.role === Role.PROVIDER;
  const isSuperAdmin = user?.role === Role.SUPER_ADMIN;

  // Accepts an explicit user so callers can pass the freshly-returned value from login()
  // rather than relying on the stale render-time store snapshot.
  const getDashboardRoute = (forUser?: AuthUser) => {
    const u = forUser ?? user;
    if (!u) return '/login';
    return roleToRoute(u.role);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isProvider,
    isSuperAdmin,
    login,
    register,
    logout,
    getDashboardRoute,
  };
}
