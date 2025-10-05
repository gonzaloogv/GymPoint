/**
 * LegalFooter - Footer con enlaces legales y versión de la app
 * Incluye Términos de Uso, Privacidad y Soporte
 */

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Card } from '@shared/components/ui';
import { AppTheme } from '@presentation/theme';

interface LegalFooterProps {
  theme: AppTheme;
}

export const LegalFooter: React.FC<LegalFooterProps> = ({ theme }) => {
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
            <Text style={{ fontSize: 14, opacity: 0.6 }}>Términos de Uso</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={{ fontSize: 14, opacity: 0.6 }}>Privacidad</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={{ fontSize: 14, opacity: 0.6 }}>Soporte</Text>
          </TouchableOpacity>
        </View>

        {/* Versión de la app */}
        <Text style={{ fontSize: 12, opacity: 0.4 }}>
          GymPoint v1.0.0
        </Text>
      </View>
    </Card>
  );
};