/**
 * UserProfileScreen - Pantalla principal de perfil de usuario
 */

import React, { useCallback, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button, ButtonText } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
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
    notifications,
    locationEnabled,
    fetchUserProfile,
    updateNotifications,
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
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1" style={{ backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4" style={{ backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
        {/* 1. Header */}
        <View className="mb-4">
          <ProfileHeader user={resolvedUser} theme={theme} />
        </View>

        {/* 2. Plan */}
        <View className="mb-4">
          {resolvedUser.plan === 'Free' ? (
            <PremiumAlert onUpgrade={handleUpgradeToPremium} />
          ) : (
            <PremiumBadge />
          )}
        </View>

        {/* 3. Configuraciones */}
        <View className="mb-4">
          <SettingsCard
            notifications={notifications}
            onNotificationToggle={handleNotificationToggle}
            locationEnabled={locationEnabled}
            onLocationToggle={toggleLocation}
          />
        </View>

        {/* 5. Menú */}
        <View className="mb-4">
          <MenuOptions isPremium={resolvedUser.plan === 'Premium'} theme={theme} />
        </View>

        {/* 6. Beneficios Premium */}
        {resolvedUser.plan === 'Free' && (
          <View className="mb-4">
            <PremiumBenefitsCard onUpgrade={handleUpgradeToPremium} />
          </View>
        )}

        {/* 7. Footer */}
        <View className="mb-4">
          <LegalFooter theme={theme} />
        </View>

        {/* 8. Eliminar cuenta */}
        <View className="mb-4">
          <DeleteAccountSection
            deletionRequest={deletionRequest}
            hasActiveRequest={hasActiveRequest}
            onRequestDeletion={requestDeletion}
            onCancelDeletion={cancelDeletion}
            loading={deletionLoading}
          />
        </View>

        {/* 9. Logout */}
        <Button
          onPress={handleLogoutPress}
          className="mb-4"
          style={{
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: isDark ? '#EF4444' : '#F87171',
          }}
        >
          <Feather
            name="log-out"
            size={16}
            color={isDark ? '#EF4444' : '#F87171'}
            style={{ marginRight: 8 }}
          />
          <ButtonText style={{ color: isDark ? '#EF4444' : '#F87171' }}>Cerrar sesión</ButtonText>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;
