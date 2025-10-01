/**
 * UserProfileScreen - Pantalla principal de perfil de usuario
 */

import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Container, ContentWrapper, Button, ButtonText } from '../styles/profilesStyles';
import { ProfileHeader } from '../components/ProfileHeader';
import { PremiumAlert } from '../components/PremiumAlert';
import { PremiumBadge } from '../components/PremiumBadge';
import { StatsSection } from '../components/StatsSection';
import { SettingsCard } from '../components/SettingsCard';
import { MenuOptions } from '../components/MenuOptions';
import { PremiumBenefitsCard } from '../components/PremiumBenefitsCard';
import { LegalFooter } from '../components/LegalFooter';
import {
  UserProfileScreenProps,
  NotificationSettings,
  UserStats,
} from '../types/userTypes';

// Importar el tema
import { lightTheme } from '@config/theme';

// Importar usuarios mocks
import { mockUserFree } from '../../auth/mocks/user.mocks';

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  user = mockUserFree, // <-- si no viene user, usamos el mock por defecto
  onLogout,
  onUpdateUser,
}) => {
  const theme = lightTheme;

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
    const updatedUser = { ...user, plan: 'Premium' as const };
    onUpdateUser?.(updatedUser);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <Container theme={theme}>
      <ContentWrapper theme={theme}>
        {/* 1. Header */}
        <ProfileHeader user={user} theme={theme} />

        {/* 2. Plan */}
        {user.plan === 'Free' ? (
          <PremiumAlert onUpgrade={handleUpgradeToPremium} theme={theme} />
        ) : (
          <PremiumBadge theme={theme} />
        )}

        {/* 3. Stats */}
        <StatsSection
          stats={stats}
          isPremium={user.plan === 'Premium'}
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
        <MenuOptions isPremium={user.plan === 'Premium'} theme={theme} />

        {/* 6. Beneficios Premium */}
        {user.plan === 'Free' && (
          <PremiumBenefitsCard onUpgrade={handleUpgradeToPremium} theme={theme} />
        )}

        {/* 7. Footer */}
        <LegalFooter theme={theme} />

        {/* 8. Logout */}
        <Button
          outline
          onPress={onLogout}
          theme={theme}
          style={{ marginBottom: theme.spacing(2) }}
        >
          <Feather size={16} color={theme.colors.danger} style={{ marginRight: 8 }} />
          <ButtonText outline theme={theme}>
            Cerrar sesión
          </ButtonText>
        </Button>
      </ContentWrapper>
    </Container>
  );
};

export default UserProfileScreen;
