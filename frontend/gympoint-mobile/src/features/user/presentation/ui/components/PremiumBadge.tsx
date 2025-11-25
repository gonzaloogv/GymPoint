/**
 * PremiumBadge - Badge que indica el estado Premium del usuario
 * Se muestra solo a usuarios con plan Premium activo
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

export const PremiumBadge: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View
      className="rounded-2xl p-4 mb-4 border"
      style={{
        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : '#F3E8FF',
        borderColor: isDark ? 'rgba(192, 132, 252, 0.4)' : '#C084FC',
      }}
    >
      {/* Header con icono y título */}
      <View className="flex-row items-center gap-2 mb-2">
        <Ionicons
          name="ribbon-outline"
          size={18}
          color={isDark ? '#C084FC' : '#9333EA'}
        />
        <Text
          className="font-bold text-base"
          style={{ color: isDark ? '#E9D5FF' : '#7C3AED' }}
        >
          Usuario Premium
        </Text>
      </View>

      {/* Mensaje de agradecimiento */}
      <Text
        className="text-sm font-medium"
        style={{ color: isDark ? '#D8B4FE' : '#9333EA' }}
      >
        Disfrutás de todos los beneficios Premium. ¡Gracias por tu apoyo!
      </Text>
    </View>
  );
};
