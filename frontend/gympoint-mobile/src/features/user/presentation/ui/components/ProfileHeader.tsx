/**
 * ProfileHeader - Componente del header del perfil
 * Muestra la información principal del usuario: avatar, nombre, email, plan y racha
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Card, Avatar } from '@shared/components/ui';
import { UserProfile } from '@features/user/types/userTypes';
import { useTheme } from '@shared/hooks';
import StreakIcon from '@assets/icons/streak.svg';
import { Ionicons } from '@expo/vector-icons';

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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 9999,
                borderWidth: 1,
                backgroundColor: isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(129, 140, 248, 0.12)',
                borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
              }}
            >
              {user.plan === 'Premium' && (
                <Ionicons
                  name="star"
                  size={14}
                  color={isDark ? '#C7D2FE' : '#4338CA'}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 14,
                  color: isDark ? '#C7D2FE' : '#4338CA',
                }}
              >
                {user.plan}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 9999,
                borderWidth: 1,
                backgroundColor: isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(129, 140, 248, 0.12)',
                borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
              }}
            >
              <StreakIcon width={18} height={18} accessibilityLabel="racha" />
              <Text
                style={{
                  marginLeft: 4,
                  fontWeight: '600',
                  fontSize: 14,
                  color: isDark ? '#C7D2FE' : '#4338CA',
                }}
              >
                {user.streak || 0} días
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};
