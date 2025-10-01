/**
 * PremiumBadge - Badge que indica el estado Premium del usuario
 * Se muestra solo a usuarios con plan Premium activo
 */

import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GradientCard, BodyText, SmallText } from '../styles/ProfilesStyles';
import { AppTheme } from '@config/theme';

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
        <Feather size={20} color="#9333EA" />
        <BodyText style={{ fontWeight: '600', color: '#7C3AED' }}>
          Usuario Premium
        </BodyText>
      </View>

      {/* Mensaje de agradecimiento */}
      <SmallText style={{ color: '#7C3AED' }}>
        Disfrutás de todos los beneficios Premium. ¡Gracias por tu apoyo!
      </SmallText>
    </GradientCard>
  );
};