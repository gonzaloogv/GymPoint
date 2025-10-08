/**
 * LocationSettings - Configuración de ubicación
 * Permite al usuario controlar el acceso a su ubicación para encontrar gimnasios cercanos
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SwitchRow } from '@shared/components/ui';
import { Section, SectionTitle } from '../styles/ProfileStyles';
import { AppTheme } from '@presentation/theme';

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
        <Text style={{ fontWeight: '600', fontSize: 16 }}>Ubicación</Text>
      </SectionTitle>

      {/* Switch de ubicación */}
      <View>
        <Text style={{ fontWeight: '500', fontSize: 16, marginBottom: 4 }}>
          Acceso a ubicación
        </Text>
        <Text style={{ fontSize: 12, opacity: 0.6, color: '#666', marginBottom: 8 }}>
          Para encontrar gimnasios cercanos
        </Text>
        <SwitchRow
          label="Activar ubicación"
          value={locationEnabled}
          onValueChange={onToggle}
        />
      </View>
    </Section>
  );
};
