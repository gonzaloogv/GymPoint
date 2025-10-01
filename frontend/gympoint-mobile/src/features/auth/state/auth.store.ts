// src/features/auth/state/auth.store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { User } from '../domain/entities/User'; // Asegúrate de que User sea accesible

// 1. Define la interfaz del estado CON la nueva función.
type AuthState = {
  user: User | null;
  setUser: (u: User | null) => void;
  // ¡NUEVA FUNCIÓN AÑADIDA! Permite actualizar el objeto User sin reescribir todo el store.
  updateUser: (u: User) => void;
};

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user: null,

    // Función para establecer el usuario (Login/Logout)
    setUser: (u) =>
      set((s) => {
        s.user = u;
      }),

    // 2. Implementación de la nueva función
    updateUser: (u) =>
      set((s) => {
        // Usamos 'immer' para mutar el estado de forma segura.
        // Aquí, reemplazamos el objeto user por el nuevo objeto User que recibimos (con los tokens actualizados).
        if (s.user) {
          s.user = u;
        }
      }),
  })),
);
