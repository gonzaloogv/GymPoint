/**
 * NotificationSettings - Configuración de notificaciones
 * Permite al usuario controlar qué tipo de notificaciones desea recibir
 */

import React from 'react';
import { Switch as RNSwitch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Section,
  SectionTitle,
  BodyText,
  SmallText,
  SwitchRow,
  SwitchRowLeft,
} from '../styles/ProfilesStyles';
import { NotificationSettings as NotificationSettingsType } from '../types/UserTypes';
import { AppTheme } from '@config/theme';

interface NotificationSettingsProps {
  notifications: NotificationSettingsType;
  onToggle: (key: keyof NotificationSettingsType, value: boolean) => void;
  theme: AppTheme;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notifications,
  onToggle,
  theme,
}) => {
  return (
    <Section theme={theme}>
      {/* Título de la sección */}
      <SectionTitle theme={theme}>
        <Feather size={16} color={theme.colors.text} />
        <BodyText style={{ fontWeight: '600' }}>Notificaciones</BodyText>
      </SectionTitle>

      {/* Recordatorios de check-in */}
      <SwitchRow theme={theme}>
        <SwitchRowLeft>
          <BodyText style={{ fontWeight: '500' }}>
            Recordatorios de check-in
          </BodyText>
          <SmallText muted style={{ opacity: 0.6 }}>
            Te avisamos para mantener tu racha
          </SmallText>
        </SwitchRowLeft>
        <RNSwitch
          value={notifications.checkinReminders}
          onValueChange={(value) => onToggle('checkinReminders', value)}
          trackColor={{ false: '#D1D5DB', true: '#4F9CF9' }}
          thumbColor="#FFFFFF"
        />
      </SwitchRow>

      {/* Alertas de racha */}
      <SwitchRow theme={theme}>
        <SwitchRowLeft>
          <BodyText style={{ fontWeight: '500' }}>Alertas de racha</BodyText>
          <SmallText muted style={{ opacity: 0.6 }}>
            Notificaciones sobre milestones
          </SmallText>
        </SwitchRowLeft>
        <RNSwitch
          value={notifications.streakAlerts}
          onValueChange={(value) => onToggle('streakAlerts', value)}
          trackColor={{ false: '#D1D5DB', true: '#4F9CF9' }}
          thumbColor="#FFFFFF"
        />
      </SwitchRow>

      {/* Nuevas recompensas */}
      <SwitchRow theme={theme}>
        <SwitchRowLeft>
          <BodyText style={{ fontWeight: '500' }}>Nuevas recompensas</BodyText>
          <SmallText muted style={{ opacity: 0.6 }}>
            Cuando hay nuevos canjes disponibles
          </SmallText>
        </SwitchRowLeft>
        <RNSwitch
          value={notifications.rewardUpdates}
          onValueChange={(value) => onToggle('rewardUpdates', value)}
          trackColor={{ false: '#D1D5DB', true: '#4F9CF9' }}
          thumbColor="#FFFFFF"
        />
      </SwitchRow>
    </Section>
  );
};