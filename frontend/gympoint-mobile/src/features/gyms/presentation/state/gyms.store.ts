import { create } from 'zustand';

interface GymsStoreState {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

/**
 * Store simple para manejar la recarga de gimnasios desde eventos de WebSocket
 */
export const useGymsStore = create<GymsStoreState>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
