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
      className="rounded-2xl p-5 mb-4 border"
      style={{
        backgroundColor: isDark ? '#2D1B4E' : '#F3E8FF',
        borderColor: isDark ? '#7C3AED' : '#C084FC',
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
              color: isDark ? '#E9D5FF' : '#7C3AED',
            }}
          >
            ¡Actualizá a Premium!
          </Text>

          {/* Descripción */}
          <Text
            className="text-xs mb-3"
            style={{
              color: isDark ? '#D8B4FE' : '#7C3AED',
            }}
          >
            Desbloqueá estadísticas avanzadas, recompensas exclusivas y más.
          </Text>

          {/* Botón de acción */}
          <TouchableOpacity
            className="rounded px-4 py-2 items-center justify-center"
            style={{
              backgroundColor: '#9333EA',
              opacity: 0.5,
            }}
            // onPress={onUpgrade} // DESACTIVADO: Trae datos mock que sobrescriben datos reales
            disabled
          >
            <Text className="font-semibold text-xs" style={{ color: '#FFFFFF' }}>
              Próximamente
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
