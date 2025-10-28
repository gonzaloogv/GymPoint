import { create } from 'zustand';
import { Achievement } from '../../domain/entities/Achievement';
import { DI } from '@di/container';

interface AchievementsState {
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  fetchAchievements: () => Promise<void>;
  syncAchievements: () => Promise<void>;
}

export const useAchievementsStore = create<AchievementsState>((set) => ({
  achievements: [],
  isLoading: false,
  error: null,

  fetchAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const achievements = await DI.getAchievements.execute();
      set({ achievements, isLoading: false });
    } catch (error) {
      console.error('Error fetching achievements:', error);
      set({ error: 'Error al cargar logros', isLoading: false });
    }
  },

  syncAchievements: async () => {
    try {
      await DI.syncAchievements.execute();
      const achievements = await DI.getAchievements.execute();
      set({ achievements });
    } catch (error) {
      console.error('Error syncing achievements:', error);
    }
  },
}));
