import { useProgressStore } from '@features/progress/presentation/state/progress.store';

export function useProgress() {
  const store = useProgressStore();

  return {
    // State
    currentStreak: store.currentStreak,
    weeklyWorkouts: store.weeklyWorkouts,
    metrics: store.metrics,
    selectedPeriod: store.selectedPeriod,
    tokenData: store.tokenData,
    tokenFilter: store.tokenFilter,
    achievements: store.achievements,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    setCurrentStreak: store.setCurrentStreak,
    setWeeklyWorkouts: store.setWeeklyWorkouts,
    setMetrics: store.setMetrics,
    setSelectedPeriod: store.setSelectedPeriod,
    setTokenData: store.setTokenData,
    setTokenFilter: store.setTokenFilter,
    setAchievements: store.setAchievements,
    setLoading: store.setLoading,
    setError: store.setError,
    reset: store.reset,
  };
}
