"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  /** Access + refresh tokens live in HttpOnly Next.js cookies (see Server Actions). */
  setAuth: (user: AuthUser) => void;
  patchUser: (partial: Partial<AuthUser>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user) => set({ user }),
      patchUser: (partial) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...partial } : null,
        })),
      clearAuth: () => set({ user: null }),
    }),
    {
      name: "elctro-auth-user",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
