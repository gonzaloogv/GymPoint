import { create } from 'zustand';
import * as Location from 'expo-location';

import { HomeStats } from '../../domain/entities/HomeStats';
import { WeeklyProgress } from '../../domain/entities/WeeklyProgress';
import { DailyChallenge } from '../../domain/entities/DailyChallenge';
import { DI } from '@di/container';

type PermissionStatus = 'granted' | 'denied' | 'prompt';

interface HomeState {
  // State
  user: HomeStats | null;
  weeklyProgress: WeeklyProgress | null;
  dailyChallenge: DailyChallenge | null;
  locationPermission: PermissionStatus;
  isLoading: boolean;

  // Actions
  fetchHomeData: () => Promise<void>;
  checkLocationPermission: () => Promise<void>;
  requestLocationPermission: () => Promise<void>;
  setUser: (user: HomeStats) => void;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  // Initial state
  user: null,
  weeklyProgress: null,
  dailyChallenge: null,
  locationPermission: 'prompt',
  isLoading: false,

  // Actions
  fetchHomeData: async () => {
    set({ isLoading: true });
    try {
      const [user, progress, challenge] = await Promise.all([
        DI.getHomeStats.execute(),
        DI.getWeeklyProgress.execute(),
        DI.getDailyChallenge.execute(),
      ]);

      set({
        user,
        weeklyProgress: progress,
        dailyChallenge: challenge,
      });
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  checkLocationPermission: async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    set({ locationPermission: status as PermissionStatus });
  },

  requestLocationPermission: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    set({ locationPermission: status as PermissionStatus });
  },

  setUser: (user) => set({ user }),
}));
