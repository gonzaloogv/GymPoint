import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ProgressMetric, TokenData, Achievement } from '@features/progress/domain/entities/ProgressMetric';

interface ProgressState {
  // KPI Data
  currentStreak: number;
  weeklyWorkouts: number;

  // Metrics
  metrics: ProgressMetric[];
  selectedPeriod: '7d' | '30d' | '90d' | '12m';

  // Token Data
  tokenData: TokenData;
  tokenFilter: 'all' | 'earned' | 'spent';

  // Achievements
  achievements: Achievement[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentStreak: (streak: number) => void;
  setWeeklyWorkouts: (workouts: number) => void;
  setMetrics: (metrics: ProgressMetric[]) => void;
  setSelectedPeriod: (period: '7d' | '30d' | '90d' | '12m') => void;
  setTokenData: (data: TokenData) => void;
  setTokenFilter: (filter: 'all' | 'earned' | 'spent') => void;
  setAchievements: (achievements: Achievement[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentStreak: 14,
  weeklyWorkouts: 4,
  metrics: [],
  selectedPeriod: '90d' as const,
  tokenData: {
    available: 245,
    earned: 1840,
    spent: 1595,
  },
  tokenFilter: 'all' as const,
  achievements: [],
  isLoading: false,
  error: null,
};

export const useProgressStore = create<ProgressState>()(
  immer((set) => ({
    ...initialState,

    setCurrentStreak: (streak) =>
      set((state) => {
        state.currentStreak = streak;
      }),

    setWeeklyWorkouts: (workouts) =>
      set((state) => {
        state.weeklyWorkouts = workouts;
      }),

    setMetrics: (metrics) =>
      set((state) => {
        state.metrics = metrics;
      }),

    setSelectedPeriod: (period) =>
      set((state) => {
        state.selectedPeriod = period;
      }),

    setTokenData: (data) =>
      set((state) => {
        state.tokenData = data;
      }),

    setTokenFilter: (filter) =>
      set((state) => {
        state.tokenFilter = filter;
      }),

    setAchievements: (achievements) =>
      set((state) => {
        state.achievements = achievements;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),

    reset: () => set(initialState),
  })),
);
