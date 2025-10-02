import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

import { Reward } from '@features/rewards/domain/entities/Reward';
import { GeneratedCode } from '@features/rewards/domain/entities/GeneratedCode';
import { DI } from '@di/container';

type RewardsTab = 'available' | 'codes';

interface RewardsState {
  // State
  activeTab: RewardsTab;
  rewards: Reward[];
  generatedCodes: GeneratedCode[];
  isLoadingRewards: boolean;
  isLoadingCodes: boolean;

  // Actions
  setActiveTab: (tab: RewardsTab) => void;
  fetchRewards: (isPremium: boolean) => Promise<void>;
  fetchGeneratedCodes: () => Promise<void>;
  handleGenerate: (reward: Reward, userTokens: number, onUpdateUser: (tokens: number) => void) => Promise<void>;
  handleCopy: (code: string) => Promise<void>;
  handleToggleCode: (code: GeneratedCode) => void;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  // Initial state
  activeTab: 'available',
  rewards: [],
  generatedCodes: [],
  isLoadingRewards: false,
  isLoadingCodes: false,

  // Actions
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

  fetchGeneratedCodes: async () => {
    set({ isLoadingCodes: true });
    try {
      const codes = await DI.getGeneratedCodes.execute();
      set({ generatedCodes: codes });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al cargar códigos' });
    } finally {
      set({ isLoadingCodes: false });
    }
  },

  handleGenerate: async (reward, userTokens, onUpdateUser) => {
    if (userTokens < reward.cost) {
      Toast.show({ type: 'error', text1: 'No tenés suficientes tokens para esta recompensa' });
      return;
    }

    const code = `GP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const newCode: GeneratedCode = {
      id: Date.now().toString(),
      rewardId: reward.id,
      code,
      title: reward.title,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + reward.validDays * 86400000),
      used: false,
    };

    set((state) => ({
      generatedCodes: [newCode, ...state.generatedCodes],
      activeTab: 'codes',
    }));

    const newTokens = userTokens - reward.cost;
    onUpdateUser(newTokens);

    Toast.show({ type: 'success', text1: `¡Código generado! ${code}` });
  },

  handleCopy: async (code) => {
    await Clipboard.setStringAsync(code);
    Toast.show({ type: 'success', text1: 'Código copiado al portapapeles' });
  },

  handleToggleCode: (code) => {
    const willMarkAsUsed = !code.used;
    set((state) => ({
      generatedCodes: state.generatedCodes.map((item) =>
        item.id === code.id
          ? {
              ...item,
              used: willMarkAsUsed,
              usedAt: willMarkAsUsed ? new Date() : undefined,
            }
          : item
      ),
    }));

    Toast.show({
      type: 'info',
      text1: `Código marcado como ${willMarkAsUsed ? 'USADO' : 'DISPONIBLE'}`,
    });
  },
}));

