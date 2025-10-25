/**
 * UserProfileScreen - Pantalla principal de perfil de usuario
 */

import React, { useCallback, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button, ButtonText } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { ProfileHeader } from '../components/ProfileHeader';
import { PremiumAlert } from '../components/PremiumAlert';
import { PremiumBadge } from '../components/PremiumBadge';
import { StatsSection } from '../components/StatsSection';
import { SettingsCard } from '../components/SettingsCard';
import { MenuOptions } from '../components/MenuOptions';
import { PremiumBenefitsCard } from '../components/PremiumBenefitsCard';
import { LegalFooter } from '../components/LegalFooter';
import { useUserProfileStore } from '../../state/userProfile.store';
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
    stats,
    notifications,
    locationEnabled,
    fetchUserProfile,
    fetchUserStats,
    updateNotifications,
    toggleLocation,
    upgradeToPremium,
  } = useUserProfileStore();

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================
  const handleLogoutPress = useCallback(() => {
    onLogout?.();
  }, [onLogout]);

  const handleNotificationToggle = async (
    key: keyof typeof notifications,
    value: boolean,
  ) => {
    await updateNotifications(key, value);
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
  const defaultStats = {
    totalCheckIns: 0,
    longestStreak: 0,
    favoriteGym: '-',
    monthlyVisits: 0,
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1" style={{ backgroundColor: isDark ? '#0f1419' : '#ffffff' }}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4 gap-4">
        {/* 1. Header */}
        <ProfileHeader user={resolvedUser} theme={theme} />

        {/* 2. Plan */}
        {resolvedUser.plan === 'Free' ? (
          <PremiumAlert onUpgrade={handleUpgradeToPremium} />
        ) : (
          <PremiumBadge />
        )}

        {/* 3. Stats */}
        <StatsSection
          stats={stats || defaultStats}
          isPremium={resolvedUser.plan === 'Premium'}
        />

        {/* 4. Configuraciones */}
        <SettingsCard
          notifications={notifications}
          onNotificationToggle={handleNotificationToggle}
          locationEnabled={locationEnabled}
          onLocationToggle={toggleLocation}
        />

        {/* 5. Menú */}
        <MenuOptions isPremium={resolvedUser.plan === 'Premium'} theme={theme} />

        {/* 6. Beneficios Premium */}
        {resolvedUser.plan === 'Free' && (
          <PremiumBenefitsCard onUpgrade={handleUpgradeToPremium} />
        )}

        {/* 7. Footer */}
        <LegalFooter theme={theme} />

        {/* 8. Logout */}
        <Button
          onPress={handleLogoutPress}
          className="mb-4"
          style={{
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.danger,
          }}
        >
          <Feather
            name="log-out"
            size={16}
            color={theme.colors.danger}
            style={{ marginRight: 8 }}
          />
          <ButtonText style={{ color: theme.colors.danger }}>Cerrar sesión</ButtonText>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;
