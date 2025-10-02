/**
 * LocationSettings - Configuración de ubicación
 * Permite al usuario controlar el acceso a su ubicación para encontrar gimnasios cercanos
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
} from '../styles/ProfileStyles';
import { AppTheme } from '@config/theme';

interface LocationSettingsProps {
  locationEnabled: boolean;
  onToggle: (value: boolean) => void;
  theme: AppTheme;
}

export const LocationSettings: React.FC<LocationSettingsProps> = ({
  locationEnabled,
  onToggle,
  theme,
}) => {
  return (
    <Section theme={theme}>
      {/* Título de la sección */}
      <SectionTitle theme={theme}>
        <Feather name="map-pin" size={16} color={theme.colors.text} />
        <BodyText style={{ fontWeight: '600' }}>Ubicación</BodyText>
      </SectionTitle>

      {/* Switch de ubicación */}
      <SwitchRow theme={theme}>
        <SwitchRowLeft>
          <BodyText style={{ fontWeight: '500' }}>Acceso a ubicación</BodyText>
          <SmallText muted style={{ opacity: 0.6 }}>
            Para encontrar gimnasios cercanos
          </SmallText>
        </SwitchRowLeft>
        <RNSwitch
          value={locationEnabled}
          onValueChange={onToggle}
          trackColor={{ false: '#D1D5DB', true: '#4F9CF9' }}
          thumbColor="#FFFFFF"
        />
      </SwitchRow>
    </Section>
  );
};