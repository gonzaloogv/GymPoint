import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

import { Reward } from '@features/rewards/domain/entities/Reward';
import { GeneratedCode } from '@features/rewards/domain/entities/GeneratedCode';
import { ClaimedReward } from '@features/rewards/domain/entities/ClaimedReward';
import { DI } from '@di/container';

type RewardsTab = 'available'; // | 'codes'; // COMENTADO: Sistema sin códigos por ahora

interface RewardsState {
  // State
  activeTab: RewardsTab;
  rewards: Reward[];
  // generatedCodes: GeneratedCode[]; // COMENTADO: Sistema sin códigos por ahora
  claimedRewards: ClaimedReward[];
  isLoadingRewards: boolean;
  isLoadingCodes: boolean;
  userId: number | null;

  // Actions
  setUserId: (userId: number) => void;
  setActiveTab: (tab: RewardsTab) => void;
  fetchRewards: (isPremium: boolean) => Promise<void>;
  // fetchGeneratedCodes: () => Promise<void>; // COMENTADO: Sistema sin códigos por ahora
  fetchClaimedRewards: (userId: number) => Promise<void>;
  handleGenerate: (
    reward: Reward,
    userTokens: number,
    userId: number,
    onUpdateUser: (tokens: number) => void,
  ) => Promise<void>;
  // handleCopy: (code: string) => Promise<void>; // COMENTADO: Sistema sin códigos por ahora
  // handleToggleCode: (code: GeneratedCode) => void; // COMENTADO: Sistema sin códigos por ahora
  handleToggleClaimedReward: (claimedRewardId: number) => Promise<void>;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  // Initial state
  activeTab: 'available',
  rewards: [],
  // generatedCodes: [], // COMENTADO: Sistema sin códigos por ahora
  claimedRewards: [],
  isLoadingRewards: false,
  isLoadingCodes: false,
  userId: null,

  // Actions
  setUserId: (userId) => set({ userId }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchRewards: async (isPremium) => {
    set({ isLoadingRewards: true });
    try {
      const rewards = await DI.getAvailableRewards.execute(isPremium);
      set({ rewards });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al cargar recompensas' });
    } finally {
      set({ isLoadingRewards: false });
    }
  },

  // COMENTADO: Sistema sin códigos por ahora
  // fetchGeneratedCodes: async () => {
  //   set({ isLoadingCodes: true });
  //   try {
  //     const codes = await DI.getGeneratedCodes.execute();
  //     set({ generatedCodes: codes });
  //   } catch (error) {
  //     Toast.show({ type: 'error', text1: 'Error al cargar códigos' });
  //   } finally {
  //     set({ isLoadingCodes: false });
  //   }
  // },

  fetchClaimedRewards: async (userId: number) => {
    set({ isLoadingCodes: true });
    try {
      const claimed = await DI.getClaimedRewards.execute(userId);
      set({ claimedRewards: claimed });
    } catch (error) {
      console.error('[RewardsStore] Error fetching claimed rewards:', error);
      Toast.show({ type: 'error', text1: 'Error al cargar recompensas canjeadas' });
    } finally {
      set({ isLoadingCodes: false });
    }
  },

  handleGenerate: async (reward, userTokens, userId, onUpdateUser) => {
    if (userTokens < reward.cost) {
      Toast.show({
        type: 'error',
        text1: 'No tenés suficientes tokens para esta recompensa',
      });
      return;
    }

    try {
      // Calculate expiration date (90 days from now if not specified)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (reward.validDays || 90));

      // Claim the reward using the real API
      const claimed = await DI.claimReward.execute(Number(reward.id), {
        tokensSpent: reward.cost,
        expiresAt: expiresAt.toISOString(),
      });

      // Update local state with the claimed reward
      set((state) => ({
        claimedRewards: [claimed, ...state.claimedRewards],
        // activeTab: 'codes', // COMENTADO: Sistema sin códigos por ahora
      }));

      // Update user tokens
      const newTokens = userTokens - reward.cost;
      onUpdateUser(newTokens);

      Toast.show({
        type: 'success',
        text1: '¡Recompensa canjeada!',
        // text2: claimed.code ? `Código: ${claimed.code}` : undefined, // COMENTADO: Sistema sin códigos por ahora
      });

      // Refresh claimed rewards to get latest data
      get().fetchClaimedRewards(userId);
    } catch (error: any) {
      console.error('[RewardsStore] Error claiming reward:', error);
      const errorMessage = error?.response?.data?.error?.message || 'No se pudo canjear la recompensa';
      Toast.show({
        type: 'error',
        text1: 'Error al canjear recompensa',
        text2: errorMessage,
      });
    }
  },

  // COMENTADO: Sistema sin códigos por ahora
  // handleCopy: async (code) => {
  //   await Clipboard.setStringAsync(code);
  //   Toast.show({ type: 'success', text1: 'Código copiado al portapapeles' });
  // },

  // COMENTADO: Sistema sin códigos por ahora
  // handleToggleCode: (code) => {
  //   const willMarkAsUsed = !code.used;
  //   set((state) => ({
  //     generatedCodes: state.generatedCodes.map((item) =>
  //       item.id === code.id
  //         ? {
  //             ...item,
  //             used: willMarkAsUsed,
  //             usedAt: willMarkAsUsed ? new Date() : undefined,
  //           }
  //         : item,
  //     ),
  //   }));

  //   Toast.show({
  //     type: 'info',
  //     text1: `Código marcado como ${willMarkAsUsed ? 'USADO' : 'DISPONIBLE'}`,
  //   });
  // },

  handleToggleClaimedReward: async (claimedRewardId: number) => {
    try {
      const updated = await DI.markClaimedRewardAsUsed.execute(claimedRewardId);

      // Update local state
      set((state) => ({
        claimedRewards: state.claimedRewards.map((item) =>
          item.id === String(claimedRewardId) ? updated : item
        ),
      }));

      Toast.show({
        type: 'success',
        text1: 'Recompensa marcada como usada',
      });
    } catch (error: any) {
      console.error('[RewardsStore] Error marking reward as used:', error);
      const errorMessage = error?.response?.data?.error?.message || 'No se pudo marcar la recompensa';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  },
}));
