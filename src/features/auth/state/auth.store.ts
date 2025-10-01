// src/features/auth/state/auth.store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { User } from '../domain/entities/User';
import { mockUserFree } from '../mocks/user.mocks';

type AuthState = {
  user: User | null;

  setUser: (u: User | null) => void;
  updateUser: (u: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    // Para desarrollo: arranca con usuario mock
    user: mockUserFree,

    setUser: (u) => set((s) => {
      s.user = u;
    }),

    updateUser: (u) => set((s) => {
      if (s.user) {
        s.user = u;
      }
    }),

    logout: () => set((s) => {
      s.user = null;
    }),
  }))
);
