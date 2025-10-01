import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { User } from '../domain/entities/User';

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user: null,
    setUser: (user) =>
      set((state) => {
        state.user = user;
      }),
    updateUser: (user) =>
      set((state) => {
        if (state.user) {
          state.user = user;
        }
      }),
  })),
);
