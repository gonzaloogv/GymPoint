import { create } from 'zustand';
import { TokenTransaction, TokenTransactionFilters, TokenHistory, TokenBalance } from '../../domain/entities/TokenTransaction';
import { DI } from '@di/container';

interface TokensState {
  history: TokenHistory | null;
  balance: TokenBalance | null;
  isLoadingHistory: boolean;
  isLoadingBalance: boolean;
  error: string | null;

  fetchTokenHistory: (filters?: TokenTransactionFilters) => Promise<void>;
  fetchTokenBalance: () => Promise<void>;
  clearError: () => void;
  setBalanceValue: (value: number) => void;
  updateTokenDelta: (delta: number) => void;
  invalidateHistory: () => void;
}

export const useTokensStore = create<TokensState>((set) => ({
  history: null,
  balance: null,
  isLoadingHistory: false,
  isLoadingBalance: false,
  error: null,

  fetchTokenHistory: async (filters?: TokenTransactionFilters) => {
    set({ isLoadingHistory: true, error: null });
    try {
      const history = await DI.getTokenHistory.execute(filters);
      set({ history, isLoadingHistory: false });
    } catch (error) {
      console.error('Error fetching token history:', error);
      set({ error: 'Error al cargar historial de tokens', isLoadingHistory: false });
    }
  },

  fetchTokenBalance: async () => {
    set({ isLoadingBalance: true, error: null });
    try {
      const balance = await DI.getTokenBalance.execute();
      set({ balance, isLoadingBalance: false });
    } catch (error) {
      console.error('Error fetching token balance:', error);
      set({ error: 'Error al cargar balance de tokens', isLoadingBalance: false });
    }
  },

  clearError: () => set({ error: null }),

  setBalanceValue: (value: number) =>
    set((state) => {
      if (!state.balance) {
        return {
          balance: {
            available: value,
            earned: value,
            spent: 0,
          },
        };
      }
      return { balance: { ...state.balance, available: value } };
    }),

  /**
   * Actualiza earned/spent basado en delta de tokens (desde WS)
   * @param delta - Positivo = ganados, Negativo = gastados
   */
  updateTokenDelta: (delta: number) =>
    set((state) => {
      if (!state.balance) return state;

      if (delta > 0) {
        return {
          balance: {
            ...state.balance,
            earned: state.balance.earned + delta,
          },
        };
      } else if (delta < 0) {
        return {
          balance: {
            ...state.balance,
            spent: state.balance.spent + Math.abs(delta),
          },
        };
      }

      return state;
    }),

  /**
   * Marca el historial como stale para forzar refetch
   */
  invalidateHistory: () => set({ history: null }),
}));
