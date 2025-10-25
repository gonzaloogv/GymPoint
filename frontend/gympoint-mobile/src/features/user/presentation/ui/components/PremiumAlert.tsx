/**
 * PremiumAlert - Componente de alerta promocional
 * Se muestra a usuarios con plan Free para promocionar el plan Premium
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface PremiumAlertProps {
  onUpgrade: () => void;
}

export const PremiumAlert: React.FC<PremiumAlertProps> = ({ onUpgrade }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View
      className="rounded-md p-4 mb-4 border"
      style={{
        backgroundColor: isDark ? '#F3E8FF' : '#F3E8FF',
        borderColor: '#C084FC',
      }}
    >
      <View className="flex-row items-start gap-3">
        {/* Icono de corona */}
        <Feather name="award" size={16} color="#9333EA" />

        {/* Contenido del alert */}
        <View className="flex-1">
          {/* Título */}
          <Text
            className="font-semibold mb-1"
            style={{
              color: '#7C3AED',
            }}
          >
            ¡Actualizá a Premium!
          </Text>

          {/* Descripción */}
          <Text
            className="text-xs mb-3"
            style={{
              color: '#7C3AED',
            }}
          >
            Desbloqueá estadísticas avanzadas, recompensas exclusivas y más.
          </Text>

          {/* Botón de acción */}
          <TouchableOpacity
            className="rounded px-4 py-2 items-center justify-center"
            style={{
              backgroundColor: '#9333EA',
            }}
            onPress={onUpgrade}
          >
            <Text className="font-semibold text-xs" style={{ color: '#FFFFFF' }}>
              Ver beneficios Premium
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
