/**
 * LegalFooter - Footer con enlaces legales y versión de la app
 * Incluye Términos de Uso, Privacidad y Soporte
 */

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Card } from '@shared/components/ui';
import { AppTheme } from '@presentation/theme';
import { useTheme } from '@shared/hooks';

interface LegalFooterProps {
  theme: AppTheme;
}

export const LegalFooter: React.FC<LegalFooterProps> = ({ theme }) => {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <Card>
      <View style={{ alignItems: 'center' }}>
        {/* Enlaces legales */}
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing(3),
            marginBottom: theme.spacing(1),
          }}
        >
          <TouchableOpacity>
            <Text style={{ fontSize: 14, opacity: 0.6, color: isDark ? '#E5E7EB' : '#1A1A1A' }}>Términos de Uso</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={{ fontSize: 14, opacity: 0.6, color: isDark ? '#E5E7EB' : '#1A1A1A' }}>Privacidad</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={{ fontSize: 14, opacity: 0.6, color: isDark ? '#E5E7EB' : '#1A1A1A' }}>Soporte</Text>
          </TouchableOpacity>
        </View>

        {/* Versión de la app */}
        <Text style={{ fontSize: 12, opacity: 0.4, color: isDark ? '#E5E7EB' : '#1A1A1A' }}>GymPoint v1.0.0</Text>
      </View>
    </Card>
  );
};
