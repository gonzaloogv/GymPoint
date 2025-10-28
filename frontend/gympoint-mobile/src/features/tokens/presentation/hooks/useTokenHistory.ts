import { useEffect } from 'react';
import { useTokensStore } from '../state/tokens.store';
import { TokenTransactionFilters } from '../../domain/entities/TokenTransaction';

export const useTokenHistory = (filters?: TokenTransactionFilters) => {
  const {
    history,
    balance,
    isLoadingHistory,
    isLoadingBalance,
    error,
    fetchTokenHistory,
    fetchTokenBalance,
    clearError,
  } = useTokensStore();

  useEffect(() => {
    fetchTokenHistory(filters);
    fetchTokenBalance();
  }, [
    filters?.type,
    filters?.page,
    filters?.fromDate?.toISOString(),
    filters?.toDate?.toISOString(),
  ]);

  return {
    history,
    balance,
    isLoadingHistory,
    isLoadingBalance,
    error,
    refetchHistory: () => fetchTokenHistory(filters),
    refetchBalance: () => fetchTokenBalance(),
    clearError,
  };
};
