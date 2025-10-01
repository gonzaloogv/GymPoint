/**
 * SettingsCard - Card contenedor de todas las configuraciones
 * Agrupa las configuraciones de notificaciones y ubicación
 */

import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Card, SectionTitle, Title } from '../styles/ProfilesStyles';
import { NotificationSettings } from './NotificationSettings';
import { LocationSettings } from './LocationSettings';
import { NotificationSettings as NotificationSettingsType } from '../types/UserTypes';
import { AppTheme } from '@config/theme';

interface SettingsCardProps {
  notifications: NotificationSettingsType;
  onNotificationToggle: (
    key: keyof NotificationSettingsType,
    value: boolean
  ) => void;
  locationEnabled: boolean;
  onLocationToggle: (value: boolean) => void;
  theme: AppTheme;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  notifications,
  onNotificationToggle,
  locationEnabled,
  onLocationToggle,
  theme,
}) => {
  return (
    <Card theme={theme}>
      {/* Título principal del card */}
      <SectionTitle theme={theme}>
        <Feather size={20} color={theme.colors.text} />
        <Title theme={theme}>Configuración</Title>
      </SectionTitle>

      {/* Configuraciones de notificaciones */}
      <NotificationSettings
        notifications={notifications}
        onToggle={onNotificationToggle}
        theme={theme}
      />

      {/* Configuración de ubicación */}
      <LocationSettings
        locationEnabled={locationEnabled}
        onToggle={onLocationToggle}
        theme={theme}
      />
    </Card>
  );
};