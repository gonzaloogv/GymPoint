/**
 * ProfileHeader - Componente del header del perfil
 * Muestra la información principal del usuario: avatar, nombre, email, plan y racha
 */

import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Card,
  AvatarContainer,
  AvatarImage,
  AvatarFallback,
  Title,
  Subtitle,
  Badge,
  BadgeText,
} from '../styles/ProfilesStyles';
import { UserProfile } from '../types/UserTypes';
import { AppTheme } from '@config/theme';

interface ProfileHeaderProps {
  user: UserProfile;
  theme: AppTheme;
}

/**
 * Genera las iniciales del nombre del usuario
 * Ejemplo: "Juan Pérez" -> "JP"
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, theme }) => {
  return (
    <Card theme={theme}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing(2),
        }}
      >
        {/* Avatar del usuario */}
        <AvatarContainer theme={theme}>
          {user.avatar ? (
            <AvatarImage source={{ uri: user.avatar }} />
          ) : (
            <AvatarFallback theme={theme}>{getInitials(user.name)}</AvatarFallback>
          )}
        </AvatarContainer>

        {/* Información del usuario */}
        <View style={{ flex: 1 }}>
          <Title theme={theme}>{user.name}</Title>
          <Subtitle theme={theme}>{user.email}</Subtitle>

          {/* Badges de plan y racha */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing(1),
              marginTop: theme.spacing(1),
            }}
          >
            {/* Badge del plan (Free o Premium) */}
            <Badge premium={user.plan === 'Premium'} theme={theme}>
              {user.plan === 'Premium' && (
                <Feather
                name="star"
                size={12}
                color="#FFFFFF"
                style={{ marginRight: 4 }}
              />
              )}
              <BadgeText premium={user.plan === 'Premium'} theme={theme}>
                {user.plan}
              </BadgeText>
            </Badge>

            {/* Badge de la racha actual */}
            <Badge outline theme={theme}>
              <Feather size={12} color={theme.colors.text} style={{ marginRight: 4 }} />
              <BadgeText theme={theme}>{user.streak} días</BadgeText>
            </Badge>
          </View>
        </View>
      </View>
    </Card>
  );
};