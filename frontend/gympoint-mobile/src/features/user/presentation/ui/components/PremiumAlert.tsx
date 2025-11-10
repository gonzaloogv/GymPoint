/**
 * PremiumAlert - Componente de alerta promocional
 * Se muestra a usuarios con plan Free para promocionar el plan Premium
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface PremiumAlertProps {
  onUpgrade: () => void;
}

export const PremiumAlert: React.FC<PremiumAlertProps> = ({ onUpgrade }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 26,
        elevation: 12,
      }
    : {
        shadowColor: '#9333EA',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 22,
        elevation: 6,
      };

  return (
    <View
      className="rounded-[28px] px-5 py-[18px] border"
      style={[
        {
          backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(196, 181, 253, 0.2)',
          borderColor: isDark ? 'rgba(147, 51, 234, 0.4)' : 'rgba(147, 51, 234, 0.3)',
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row items-start gap-4">
        {/* Icono */}
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(147, 51, 234, 0.25)' : 'rgba(147, 51, 234, 0.2)',
            borderColor: isDark ? 'rgba(196, 181, 253, 0.4)' : 'rgba(147, 51, 234, 0.25)',
          }}
        >
          <Ionicons
            name="star"
            size={22}
            color={isDark ? '#E9D5FF' : '#9333EA'}
          />
        </View>

        {/* Contenido del alert */}
        <View className="flex-1">
          {/* Título */}
          <Text
            className="text-lg font-bold mb-1.5"
            style={{
              color: isDark ? '#F9FAFB' : '#111827',
            }}
          >
            ¡Actualizá a Premium!
          </Text>

          {/* Descripción */}
          <Text
            className="text-[13px] font-medium leading-[18px] mb-4"
            style={{
              color: isDark ? '#C4B5FD' : '#7C3AED',
            }}
          >
            Desbloqueá estadísticas avanzadas, recompensas exclusivas y más.
          </Text>

          {/* Botón de acción */}
          <TouchableOpacity
            className="py-3.5 rounded-2xl items-center self-start px-6"
            style={{
              backgroundColor: isDark ? '#7C3AED' : '#9333EA',
              opacity: 0.5,
            }}
            // onPress={onUpgrade} // DESACTIVADO: Trae datos mock que sobrescriben datos reales
            disabled
            activeOpacity={0.78}
          >
            <Text
              className="text-sm font-bold text-white uppercase"
              style={{ letterSpacing: 0.6 }}
            >
              Próximamente
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
