/**
 * PremiumBadge - Badge que indica el estado Premium del usuario
 * Se muestra solo a usuarios con plan Premium activo
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette } from '@shared/styles';

export const PremiumBadge: React.FC = () => {
  return (
    <View
      className="rounded-md p-4 mb-4 border"
      style={{
        backgroundColor: '#f3e8ff',
        borderColor: '#c084fc',
      }}
    >
      {/* Header con icono y título */}
      <View className="flex-row items-center gap-1 mb-2">
        <Feather name="award" size={16} color={palette.premiumDark} />
        <Text className="font-semibold text-base" style={{ color: palette.premiumLight }}>
          Usuario Premium
        </Text>
      </View>

      {/* Mensaje de agradecimiento */}
      <Text className="text-sm" style={{ color: palette.premiumLight }}>
        Disfrutás de todos los beneficios Premium. ¡Gracias por tu apoyo!
      </Text>
    </View>
  );
};
