/**
 * UserProfileScreen - Pantalla principal de perfil de usuario
 */

import React, { useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SurfaceScreen } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { SCREEN_CONTENT_STYLE } from '@shared/styles/layouts';
import { ProfileHeader } from '../components/ProfileHeader';
import { PremiumAlert } from '../components/PremiumAlert';
import { PremiumBadge } from '../components/PremiumBadge';
import { SettingsCard } from '../components/SettingsCard';
import { MenuOptions } from '../components/MenuOptions';
import { PremiumBenefitsCard } from '../components/PremiumBenefitsCard';
import { LegalFooter } from '../components/LegalFooter';
import { DeleteAccountSection } from '../components/DeleteAccountSection';
import { useUserProfileStore } from '../../state/userProfile.store';
import { useAccountDeletion } from '../../hooks/useAccountDeletion';
import { UserProfile, UserProfileScreenProps } from '../../../types/userTypes';

// Importar el tema
import { lightTheme } from '@presentation/theme';

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  user,
  onLogout,
  onUpdateUser,
}) => {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const theme = lightTheme;
  const defaultUser: UserProfile = {
    id_user: 0,
    name: 'GymPoint User',
    email: 'usuario@gympoint.com',
    role: 'USER',
    tokens: 0,
    plan: 'Free',
    streak: 0,
  };
  const resolvedUser = user ?? defaultUser;

  // ============================================
  // ZUSTAND STORE
  // ============================================
  const {
    profile,
    frequency,
    notificationsEnabled,
    isLoadingNotifications,
    isLoadingFrequency,
    locationEnabled,
    fetchUserProfile,
    fetchWeeklyFrequency,
    updateWeeklyFrequency,
    fetchNotificationSettings,
    toggleNotifications,
    toggleLocation,
    upgradeToPremium,
  } = useUserProfileStore();

  // ============================================
  // ACCOUNT DELETION HOOK
  // ============================================
  const {
    loading: deletionLoading,
    deletionRequest,
    hasActiveRequest,
    requestDeletion,
    cancelDeletion,
  } = useAccountDeletion();

  useEffect(() => {
    fetchUserProfile();
    fetchNotificationSettings();
    fetchWeeklyFrequency();
  }, [fetchUserProfile, fetchNotificationSettings, fetchWeeklyFrequency]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleLogoutPress = useCallback(() => {
    onLogout?.();
  }, [onLogout]);

  const handleNotificationToggle = async (value: boolean) => {
    await toggleNotifications(value);
  };

  const handleFrequencyUpdate = async (goal: number) => {
    await updateWeeklyFrequency(goal);
  };

  const handleUpgradeToPremium = async () => {
    await upgradeToPremium();
    if (onUpdateUser && profile) {
      onUpdateUser(profile);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <SurfaceScreen
      scroll
      contentContainerStyle={SCREEN_CONTENT_STYLE}
    >
      {/* 1. Header */}
      <ProfileHeader user={resolvedUser} theme={theme} />

      {/* 2. Plan */}
      {resolvedUser.plan === 'Free' ? (
        <PremiumAlert onUpgrade={handleUpgradeToPremium} />
      ) : (
        <PremiumBadge />
      )}

      {/* 3. Configuraciones */}
      <SettingsCard
        notificationsEnabled={notificationsEnabled}
        isLoadingNotifications={isLoadingNotifications}
        onNotificationToggle={handleNotificationToggle}
        locationEnabled={locationEnabled}
        onLocationToggle={toggleLocation}
        currentGoal={frequency?.goal ?? 3}
        pendingGoal={frequency?.pending_goal ?? null}
        isLoadingFrequency={isLoadingFrequency}
        onFrequencyUpdate={handleFrequencyUpdate}
      />

      {/* 5. Menú */}
      <MenuOptions isPremium={resolvedUser.plan === 'Premium'} theme={theme} />

      {/* 6. Beneficios Premium */}
      {resolvedUser.plan === 'Free' && (
        <PremiumBenefitsCard onUpgrade={handleUpgradeToPremium} />
      )}

      {/* 7. Footer */}
      <LegalFooter theme={theme} />

      {/* 8. Eliminar cuenta */}
      <DeleteAccountSection
        deletionRequest={deletionRequest}
        hasActiveRequest={hasActiveRequest}
        onRequestDeletion={requestDeletion}
        onCancelDeletion={cancelDeletion}
        loading={deletionLoading}
      />

      {/* 9. Logout */}
      <TouchableOpacity
        onPress={handleLogoutPress}
        activeOpacity={0.78}
        className="py-3.5 rounded-2xl items-center border"
        style={{
          borderColor: isDark ? '#EF4444' : '#F87171',
          backgroundColor: 'transparent',
        }}
      >
        <View className="flex-row items-center gap-2">
          <Feather
            name="log-out"
            size={16}
            color={isDark ? '#EF4444' : '#F87171'}
          />
          <Text
            className="text-sm font-bold uppercase"
            style={{ color: isDark ? '#EF4444' : '#F87171', letterSpacing: 0.6 }}
          >
            Cerrar sesión
          </Text>
        </View>
      </TouchableOpacity>
    </SurfaceScreen>
  );
};

export default UserProfileScreen;
