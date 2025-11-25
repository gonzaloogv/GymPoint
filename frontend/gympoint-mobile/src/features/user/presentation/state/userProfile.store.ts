import { create } from 'zustand';

import { UserProfile } from '../../domain/entities/UserProfile';
import { UserStats } from '../../domain/entities/UserStats';
import { Frequency } from '../../domain/entities/Frequency';
import { DI } from '@di/container';

interface UserProfileState {
  // State
  profile: UserProfile | null;
  stats: UserStats | null;
  frequency: Frequency | null;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  showPremiumModal: boolean;
  isLoading: boolean;
  isLoadingNotifications: boolean;
  isLoadingFrequency: boolean;

  // Actions
  fetchUserProfile: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
  fetchWeeklyFrequency: () => Promise<void>;
  updateWeeklyFrequency: (goal: number) => Promise<void>;
  fetchNotificationSettings: () => Promise<void>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  toggleLocation: (enabled: boolean) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  setShowPremiumModal: (show: boolean) => void;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  // Initial state
  profile: null,
  stats: null,
  frequency: null,
  notificationsEnabled: true,
  locationEnabled: true,
  showPremiumModal: false,
  isLoading: false,
  isLoadingNotifications: false,
  isLoadingFrequency: false,

  // Actions
  fetchUserProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await DI.getUserProfile.execute();
      set({ profile });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserStats: async () => {
    try {
      const stats = await DI.getUserProfile.execute();
      // Mock stats until we have a proper endpoint
      set({
        stats: {
          totalCheckIns: 45,
          longestStreak: 23,
          favoriteGym: 'FitMax Centro',
          monthlyVisits: 12,
        },
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  },

  fetchWeeklyFrequency: async () => {
    set({ isLoadingFrequency: true });
    try {
      const frequency = await DI.getWeeklyFrequency.execute();
      set({ frequency });
    } catch (error) {
      console.error('[userProfile.store] Error fetching weekly frequency:', error);
    } finally {
      set({ isLoadingFrequency: false });
    }
  },

  updateWeeklyFrequency: async (goal: number) => {
    const previousFrequency = get().frequency;
    console.log(`[userProfile.store] Updating frequency to: ${goal}`, { previousFrequency });
    set({ isLoadingFrequency: true });

    try {
      const updatedFrequency = await DI.updateWeeklyFrequency.execute(goal);
      console.log('[userProfile.store] Update successful:', updatedFrequency);
      set({ frequency: updatedFrequency });
    } catch (error) {
      console.error('[userProfile.store] Error updating weekly frequency:', error);
      // Revert on error
      set({ frequency: previousFrequency });
      throw error; // Re-throw so UI can show error
    } finally {
      set({ isLoadingFrequency: false });
    }
  },

  fetchNotificationSettings: async () => {
    try {
      set({ isLoadingNotifications: true });
      const settings = await DI.userRepository.getNotificationSettings();
      set({ notificationsEnabled: settings.pushEnabled });
    } catch (error) {
      console.error('[userProfile.store] Error fetching notification settings:', error);
    } finally {
      set({ isLoadingNotifications: false });
    }
  },

  toggleNotifications: async (enabled) => {
    const previousValue = get().notificationsEnabled;
    set({ notificationsEnabled: enabled, isLoadingNotifications: true });

    try {
      // Actualizar todas las notificaciones en el backend
      await DI.userRepository.updateNotificationSettings({
        pushEnabled: enabled,
        emailEnabled: enabled,
        remindersEnabled: enabled,
        achievementsEnabled: enabled,
        rewardsEnabled: enabled,
        gymUpdatesEnabled: enabled,
        paymentEnabled: enabled,
        socialEnabled: enabled,
        systemEnabled: enabled,
        challengeEnabled: enabled,
      });
    } catch (error) {
      console.error('[userProfile.store] Error updating notifications:', error);
      // Revert on error
      set({ notificationsEnabled: previousValue });
    } finally {
      set({ isLoadingNotifications: false });
    }
  },

  toggleLocation: async (enabled) => {
    const previousValue = get().locationEnabled;
    set({ locationEnabled: enabled });

    try {
      await DI.updateUserSettings.updateLocation(enabled);
    } catch (error) {
      console.error('Error updating location settings:', error);
      // Revert on error
      set({ locationEnabled: previousValue });
    }
  },

  upgradeToPremium: async () => {
    try {
      const updatedProfile = await DI.upgradeToPremium.execute();
      set({ profile: updatedProfile, showPremiumModal: false });
    } catch (error) {
      console.error('Error upgrading to premium:', error);
    }
  },

  setShowPremiumModal: (show) => set({ showPremiumModal: show }),
}));
