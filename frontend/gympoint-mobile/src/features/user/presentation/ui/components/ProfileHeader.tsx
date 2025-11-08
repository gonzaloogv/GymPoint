/**
 * ProfileHeader - Componente del header del perfil
 * Muestra la información principal del usuario: avatar, nombre, email, plan y racha
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Card, Avatar, UnifiedBadge } from '@shared/components/ui';
import { UserProfile } from '@features/user/types/userTypes';
import { useTheme } from '@shared/hooks';

interface ProfileHeaderProps {
  user: UserProfile;
  theme?: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, theme }) => {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <Card>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Avatar del usuario */}
        <Avatar userName={user.name} size={60} />

        {/* Información del usuario */}
        <View style={{ flex: 1 }}>
          <View style={{ marginBottom: 8 }}>
            <Text
              style={{ fontSize: 22, fontWeight: '700', color: isDark ? '#F9FAFB' : '#111827', marginBottom: 4 }}
            >
              {user.name}
            </Text>
            <Text style={{ fontSize: 16, color: isDark ? '#9CA3AF' : '#6B7280' }}>{user.email}</Text>
          </View>

          {/* Badges de plan y racha */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <UnifiedBadge
              variant={user.plan === 'Premium' ? 'primary' : 'secondary'}
              icon={user.plan === 'Premium' ? 'star' : undefined}
            >
              {user.plan}
            </UnifiedBadge>
            <UnifiedBadge variant="outline" icon="zap" iconColor={isDark ? '#FBBF24' : '#FFA726'}>
              {user.streak || 0} días
            </UnifiedBadge>
          </View>
        </View>
      </View>
    </Card>
  );
};
