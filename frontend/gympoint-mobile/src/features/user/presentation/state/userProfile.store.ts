import { create } from 'zustand';

import { UserProfile } from '../../domain/entities/UserProfile';
import { UserStats } from '../../domain/entities/UserStats';
import { NotificationSettings } from '../../domain/entities/NotificationSettings';
import { DI } from '@di/container';

interface UserProfileState {
  // State
  profile: UserProfile | null;
  stats: UserStats | null;
  notifications: NotificationSettings;
  locationEnabled: boolean;
  showPremiumModal: boolean;
  isLoading: boolean;

  // Actions
  fetchUserProfile: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
  updateNotifications: (key: keyof NotificationSettings, value: boolean) => Promise<void>;
  toggleLocation: (enabled: boolean) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  setShowPremiumModal: (show: boolean) => void;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  // Initial state
  profile: null,
  stats: null,
  notifications: {
    checkinReminders: true,
    streakAlerts: true,
    rewardUpdates: false,
    marketing: false,
  },
  locationEnabled: true,
  showPremiumModal: false,
  isLoading: false,

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

  updateNotifications: async (key, value) => {
    const currentNotifications = get().notifications;
    const updatedNotifications = { ...currentNotifications, [key]: value };

    set({ notifications: updatedNotifications });

    try {
      await DI.updateUserSettings.updateNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error updating notifications:', error);
      // Revert on error
      set({ notifications: currentNotifications });
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
