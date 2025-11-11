import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

import {
  Reward,
  RewardInventoryItem,
  ActiveEffectsSummary,
} from '@features/rewards/domain/entities/Reward';
import { GeneratedCode } from '@features/rewards/domain/entities/GeneratedCode';
import { ClaimedReward } from '@features/rewards/domain/entities/ClaimedReward';
import { DI } from '@di/container';

type RewardsTab = 'available'; // | 'codes'; // COMENTADO: Sistema sin códigos por ahora

interface RewardsState {
  // State
  activeTab: RewardsTab;
  rewards: Reward[];
  inventory: RewardInventoryItem[];
  activeEffects: ActiveEffectsSummary | null;
  // generatedCodes: GeneratedCode[]; // COMENTADO: Sistema sin códigos por ahora
  claimedRewards: ClaimedReward[];
  isLoadingRewards: boolean;
  isLoadingCodes: boolean;
  userId: number | null;

  // Actions
  setUserId: (userId: number) => void;
  setActiveTab: (tab: RewardsTab) => void;
  fetchRewards: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  fetchActiveEffects: () => Promise<void>;
  // fetchGeneratedCodes: () => Promise<void>; // COMENTADO: Sistema sin códigos por ahora
  fetchClaimedRewards: (userId: number) => Promise<void>;
  handleGenerate: (
    reward: Reward,
    userTokens: number,
    userId: number,
    onUpdateUser: (tokensOrUser: number | any) => void,
  ) => Promise<void>;
  // handleCopy: (code: string) => Promise<void>; // COMENTADO: Sistema sin códigos por ahora
  // handleToggleCode: (code: GeneratedCode) => void; // COMENTADO: Sistema sin códigos por ahora
  handleToggleClaimedReward: (claimedRewardId: number) => Promise<void>;
  useInventoryItem: (inventoryId: number) => Promise<void>;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  // Initial state
  activeTab: 'available',
  rewards: [],
  inventory: [],
  activeEffects: null,
  // generatedCodes: [], // COMENTADO: Sistema sin códigos por ahora
  claimedRewards: [],
  isLoadingRewards: false,
  isLoadingCodes: false,
  userId: null,

  // Actions
  setUserId: (userId) => set({ userId }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchRewards: async () => {
    set({ isLoadingRewards: true });
    try {
      const rewards = await DI.getAvailableRewards.execute();
      console.log('[RewardsStore] 🎁 Recompensas obtenidas:', {
        count: rewards.length,
        premiumRewards: rewards.filter(r => r.requiresPremium).map(r => ({
          name: r.name,
          requiresPremium: r.requiresPremium,
          canClaim: r.canClaim,
          currentStack: r.currentStack,
          maxStack: r.maxStack
        }))
      });
      set({ rewards });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al cargar recompensas' });
    } finally {
      set({ isLoadingRewards: false });
    }
  },

  fetchInventory: async () => {
    try {
      const inventory = await DI.getRewardInventory.execute();
      console.log('[RewardsStore] 📦 Inventario obtenido:', {
        count: inventory.length,
        items: inventory.map(i => ({
          id: i.id,
          type: i.itemType,
          qty: i.quantity,
          rewardName: i.reward?.name
        }))
      });
      set({ inventory });
    } catch (error) {
      console.error('[RewardsStore] Error fetching reward inventory:', error);
      Toast.show({ type: 'error', text1: 'Error al cargar inventario' });
    }
  },

  fetchActiveEffects: async () => {
    try {
      const activeEffects = await DI.getActiveRewardEffects.execute();
      set({ activeEffects });
    } catch (error) {
      console.error('[RewardsStore] Error fetching active effects:', error);
      Toast.show({ type: 'error', text1: 'Error al cargar efectos activos' });
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
    if (reward.canClaim === false) {
      Toast.show({
        type: 'error',
        text1: reward.reason || 'No podés canjear esta recompensa ahora',
      });
      return;
    }

    if (userTokens < reward.tokenCost) {
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
        tokensSpent: reward.tokenCost,
        expiresAt: expiresAt.toISOString(),
      });

      // Update local state with the claimed reward
      set((state) => ({
        claimedRewards: [claimed, ...state.claimedRewards],
      }));

      console.log('[RewardsStore] ⏳ Refreshing all data after reward claim...');

      // SIEMPRE refrescar usuario completo del backend para obtener tokens y plan actualizados
      let updatedUser = null;
      try {
        updatedUser = await DI.getMe.execute();
        console.log('[RewardsStore] ✅ User data refreshed:', {
          plan: updatedUser.plan,
          tokens: updatedUser.tokens,
          rewardType: reward.rewardType,
        });
      } catch (error) {
        console.error('[RewardsStore] ❌ Error refreshing user data:', error);
      }

      // Refrescar todas las listas en paralelo para sincronizar el estado
      const currentUserId = get().userId || userId;
      if (currentUserId) {
        await Promise.all([
          get().fetchRewards(),        // Actualiza current_stack, cooldowns, canClaim
          get().fetchInventory(),       // Muestra items acumulables
          get().fetchActiveEffects(),   // Muestra multiplicadores activos
          get().fetchClaimedRewards(currentUserId), // Actualiza claimed rewards
        ]);
        console.log('[RewardsStore] ✅ All data refreshed successfully');
      } else {
        console.warn('[RewardsStore] Cannot refresh data - userId is undefined');
      }

      // Actualizar el usuario en el componente padre DESPUÉS de refrescar todo
      if (updatedUser) {
        onUpdateUser(updatedUser); // Pass full user object
      } else {
        // Fallback: calcular tokens localmente si no se pudo obtener del backend
        const newTokens = userTokens - reward.tokenCost;
        onUpdateUser(newTokens);
      }

      // Mostrar toast de éxito DESPUÉS de que todo esté sincronizado
      Toast.show({
        type: 'success',
        text1: '¡Recompensa canjeada!',
        text2: reward.isStackable ? 'Revisa tu inventario' : undefined,
      });
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

  useInventoryItem: async (inventoryId: number) => {
    try {
      await DI.rewardRemote.useInventoryItem(inventoryId);

      // Refrescar inventario y efectos activos
      await Promise.all([
        get().fetchInventory(),
        get().fetchActiveEffects(),
      ]);

      Toast.show({
        type: 'success',
        text1: '¡Multiplicador activado!',
        text2: 'Tus tokens se multiplicarán automáticamente',
      });
    } catch (error: any) {
      console.error('[RewardsStore] Error using inventory item:', error);
      const errorMessage = error?.response?.data?.error?.message || 'No se pudo activar el multiplicador';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  },
}));
