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
import { NotificationSettings } from '../components/NotificationSettings';
import { LocationSettings } from '../components/LocationSettings';
import { MenuOptions } from '../components/MenuOptions';
import { PremiumBenefitsCard } from '../components/PremiumBenefitsCard';
import { useUserProfileStore } from '../../state/userProfile.store';
import { UserProfile, UserProfileScreenProps } from '../../../types/userTypes';

// Importar el tema
import { lightTheme } from '@presentation/theme';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f5f5f5;
`;

const ContentWrapper = styled(ScrollView)`
  flex: 1;
  padding: 16px;
`;

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  user,
  onLogout,
  onUpdateUser,
  navigation,
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

  const handleTokenHistory = useCallback(() => {
    navigation?.navigate?.('TokenHistory', { userId: resolvedUser.id_user.toString() });
  }, [navigation, resolvedUser.id_user]);

  const handleRewards = useCallback(() => {
    // Navegar a la screen de Recompensas
    navigation?.navigate?.('Rewards');
  }, [navigation]);

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
        {/* 1. Header con avatar y email */}
        <ProfileHeader user={resolvedUser} theme={theme} />

        {/* 2. Notificaciones */}
        <NotificationSettings
          notifications={notifications}
          onToggle={handleNotificationToggle}
          theme={theme}
        />

        {/* 3. Ubicación */}
        <LocationSettings
          locationEnabled={locationEnabled}
          onToggle={toggleLocation}
          theme={theme}
        />

        {/* 4. Apariencia (Modo oscuro) */}
        {/* TODO: Implementar en el futuro */}

        {/* 5. General - Menú de opciones */}
        <MenuOptions
          isPremium={resolvedUser.plan === 'Premium'}
          theme={theme}
          onTokenHistoryPress={handleTokenHistory}
          onRewardsPress={handleRewards}
        />

        {/* 6. Beneficios Premium - Solo si es Free */}
        {resolvedUser.plan === 'Free' && (
          <PremiumBenefitsCard onUpgrade={handleUpgradeToPremium} theme={theme} />
        )}

        {/* 7. Logout */}
        <Button
          onPress={handleLogoutPress}
          style={{
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(4),
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
      </ContentWrapper>
    </Container>
  );
};

export default UserProfileScreen;
