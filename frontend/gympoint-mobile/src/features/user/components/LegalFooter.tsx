/**
 * LegalFooter - Footer con enlaces legales y versión de la app
 * Incluye Términos de Uso, Privacidad y Soporte
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, SmallText } from '../styles/ProfilesStyles';
import { AppTheme } from '@config/theme';

interface LegalFooterProps {
  theme: AppTheme;
}

export const LegalFooter: React.FC<LegalFooterProps> = ({ theme }) => {
  return (
    <Card theme={theme}>
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
            <SmallText style={{ opacity: 0.6 }}>Términos de Uso</SmallText>
          </TouchableOpacity>

          <TouchableOpacity>
            <SmallText style={{ opacity: 0.6 }}>Privacidad</SmallText>
          </TouchableOpacity>

          <TouchableOpacity>
            <SmallText style={{ opacity: 0.6 }}>Soporte</SmallText>
          </TouchableOpacity>
        </View>

        {/* Versión de la app */}
        <SmallText style={{ fontSize: 12, opacity: 0.4 }}>
          GymPoint v1.0.0
        </SmallText>
      </View>
    </Card>
  );
};