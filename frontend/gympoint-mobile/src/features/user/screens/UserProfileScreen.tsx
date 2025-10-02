/**
 * UserProfileScreen - Pantalla principal de perfil de usuario
 */

import React, { useCallback, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { UserProfileLayout, Button, ButtonText } from '@shared/components/ui';
import { ProfileHeader } from '../components/ProfileHeader';
import { PremiumAlert } from '../components/PremiumAlert';
import { PremiumBadge } from '../components/PremiumBadge';
import { StatsSection } from '../components/StatsSection';
import { SettingsCard } from '../components/SettingsCard';
import { MenuOptions } from '../components/MenuOptions';
import { PremiumBenefitsCard } from '../components/PremiumBenefitsCard';
import { LegalFooter } from '../components/LegalFooter';
import {
  UserProfile,
  UserProfileScreenProps,
  NotificationSettings,
  UserStats,
} from '../types/UserTypes';

// Importar el tema
import { lightTheme } from '@presentation/theme';

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
  const handleLogoutPress = useCallback(() => {
    onLogout?.();
  }, [onLogout]);

  // ============================================
  // ESTADO LOCAL
  // ============================================
  const [notifications, setNotifications] = useState<NotificationSettings>({
    checkinReminders: true,
    streakAlerts: true,
    rewardUpdates: false,
    marketing: false,
  });

  const [locationEnabled, setLocationEnabled] = useState<boolean>(true);

  // ============================================
  // DATOS ESTÁTICOS (mock en frontend)
  // ============================================
  const stats: UserStats = {
    totalCheckIns: 45,
    longestStreak: 23,
    favoriteGym: 'FitMax Centro',
    monthlyVisits: 12,
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleNotificationToggle = (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpgradeToPremium = async () => {
    const updatedUser = { ...resolvedUser, plan: 'Premium' as const };
    onUpdateUser?.(updatedUser);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <UserProfileLayout>
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
        stats={stats}
        isPremium={resolvedUser.plan === 'Premium'}
        theme={theme}
      />

      {/* 4. Configuraciones */}
      <SettingsCard
        notifications={notifications}
        onNotificationToggle={handleNotificationToggle}
        locationEnabled={locationEnabled}
        onLocationToggle={setLocationEnabled}
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
    </UserProfileLayout>
  );
};

export default UserProfileScreen;
