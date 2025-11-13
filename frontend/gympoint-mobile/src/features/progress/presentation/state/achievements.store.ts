import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import { Achievement } from '../../domain/entities/Achievement';
import { DI } from '@di/container';

interface AchievementsState {
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  fetchAchievements: () => Promise<void>;
  syncAchievements: () => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
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

  unlockAchievement: async (achievementId: string) => {
    try {
      console.log(`[AchievementsStore] Unlocking achievement: ${achievementId}`);

      // CRÍTICO: Sincronizar ANTES de desbloquear para asegurar progreso actualizado
      console.log(`[AchievementsStore] Syncing achievements before unlock...`);
      await DI.syncAchievements.execute();
      console.log(`[AchievementsStore] Sync completed, proceeding with unlock...`);

      // Llamar al endpoint de unlock
      const unlockedAchievement = await DI.unlockAchievement.execute(achievementId);

      // Actualizar la lista local con el achievement desbloqueado
      set((state) => ({
        achievements: state.achievements.map((achievement) =>
          achievement.id === achievementId ? unlockedAchievement : achievement
        ),
      }));

      // Mostrar mensaje con tokens obtenidos
      const earnedTokens = unlockedAchievement.earnedTokens || 0;
      const tokenReward = unlockedAchievement.tokenReward || 0;
      const multiplier = unlockedAchievement.multiplier || 1;
      const unlockMessage = unlockedAchievement.unlockMessage || unlockedAchievement.name;

      let tokenMessage = '';
      if (earnedTokens > 0) {
        if (multiplier > 1) {
          tokenMessage = `+${earnedTokens} tokens (${tokenReward} × ${multiplier}x)`;
        } else {
          tokenMessage = `+${earnedTokens} tokens`;
        }
      }

      Toast.show({
        type: 'success',
        text1: '¡Logro desbloqueado!',
        text2: tokenMessage || unlockMessage,
        visibilityTime: 4000,
      });

      console.log(`[AchievementsStore] Achievement unlocked: ${earnedTokens} tokens earned`);
    } catch (error: any) {
      console.error('[AchievementsStore] Error unlocking achievement:', error);
      const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || 'No se pudo desbloquear el logro';

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  },
}));
