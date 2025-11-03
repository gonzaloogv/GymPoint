import { create } from 'zustand';

import { UserProfile } from '../../domain/entities/UserProfile';
import { UserStats } from '../../domain/entities/UserStats';
import { DI } from '@di/container';

interface UserProfileState {
  // State
  profile: UserProfile | null;
  stats: UserStats | null;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  showPremiumModal: boolean;
  isLoading: boolean;
  isLoadingNotifications: boolean;

  // Actions
  fetchUserProfile: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
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
  notificationsEnabled: true,
  locationEnabled: true,
  showPremiumModal: false,
  isLoading: false,
  isLoadingNotifications: false,

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
