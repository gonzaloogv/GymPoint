/**
 * UserProfileScreen - Pantalla principal de perfil de usuario
 */

import React, { useCallback, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { Button, ButtonText } from '@shared/components/ui';
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

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const ContentWrapper = styled(ScrollView)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(2)}px;
`;

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  user,
  onLogout,
  onUpdateUser,
}) => {
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
    value: boolean
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
    <Container edges={['top', 'left', 'right']}>
      <ContentWrapper showsVerticalScrollIndicator={false}>
        {/* 1. Header */}
        <ProfileHeader user={resolvedUser} theme={theme} />

      {/* 2. Plan */}
      {resolvedUser.plan === 'Free' ? (
        <PremiumAlert onUpgrade={handleUpgradeToPremium} theme={theme} />
      ) : (
        <PremiumBadge theme={theme} />
      )}

      {/* 3. Stats */}
      <StatsSection
        stats={stats || defaultStats}
        isPremium={resolvedUser.plan === 'Premium'}
        theme={theme}
      />

      {/* 4. Configuraciones */}
      <SettingsCard
        notifications={notifications}
        onNotificationToggle={handleNotificationToggle}
        locationEnabled={locationEnabled}
        onLocationToggle={toggleLocation}
        theme={theme}
      />

      {/* 5. Menú */}
      <MenuOptions isPremium={resolvedUser.plan === 'Premium'} theme={theme} />

      {/* 6. Beneficios Premium */}
      {resolvedUser.plan === 'Free' && (
        <PremiumBenefitsCard onUpgrade={handleUpgradeToPremium} theme={theme} />
      )}

      {/* 7. Footer */}
      <LegalFooter theme={theme} />

      {/* 8. Logout */}
      <Button
        onPress={handleLogoutPress}
        style={{ 
          marginBottom: theme.spacing(2),
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
        <ButtonText style={{ color: theme.colors.danger }}>
          Cerrar sesión
        </ButtonText>
      </Button>
      </ContentWrapper>
    </Container>
  );
};

export default UserProfileScreen;
