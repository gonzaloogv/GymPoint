import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { User } from '../domain/entities/User';


type AuthState = {
user: User | null;
setUser: (u: User | null) => void;
};


export const useAuthStore = create<AuthState>()(
immer((set) => ({
user: null,
setUser: (u) => set((s) => { s.user = u; }),
}))
);