import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '../types/api.types';
import { setAccessToken } from '../lib/api/client';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: AuthUser, accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken) => {
        // Store token in memory (not localStorage) — prevents XSS token theft
        setAccessToken(accessToken);
        set({ user, isAuthenticated: true, isLoading: false });
      },

      // Patches the cached user (e.g. after refetching /users/me) without touching the token
      setUser: (user) => set({ user }),

      clearAuth: () => {
        setAccessToken(null);
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-user',
      // Only persist the user object (not accessToken) — session storage clears on tab close
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      // isLoading starts true; reset it once rehydration completes so components don't spin forever
      onRehydrateStorage: () => (state) => {
        if (state) state.setLoading(false);
      },
    },
  ),
);
