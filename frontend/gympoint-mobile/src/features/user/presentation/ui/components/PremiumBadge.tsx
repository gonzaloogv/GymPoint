/**
 * PremiumBadge - Badge que indica el estado Premium del usuario
 * Se muestra solo a usuarios con plan Premium activo
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GradientCard } from '@shared/components/ui';
import { palette } from '@shared/styles';
import { AppTheme } from '@presentation/theme';

interface PremiumBadgeProps {
  theme: AppTheme;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ theme }) => {
  return (
    <GradientCard theme={theme}>
      {/* Header con icono y título */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing(1),
          marginBottom: 8,
        }}
      >
        <Feather name="award" size={16} color={palette.premiumDark} />
        <Text style={{ fontWeight: '600', color: palette.premiumLight, fontSize: 16 }}>
          Usuario Premium
        </Text>
      </View>

      {/* Mensaje de agradecimiento */}
      <Text style={{ color: palette.premiumLight, fontSize: 14 }}>
        Disfrutás de todos los beneficios Premium. ¡Gracias por tu apoyo!
      </Text>
    </GradientCard>
  );
};
