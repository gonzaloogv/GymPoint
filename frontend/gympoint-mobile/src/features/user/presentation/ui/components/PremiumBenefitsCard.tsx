/**
 * PremiumBenefitsCard - Card que muestra los beneficios del plan Premium
 * Se muestra solo a usuarios con plan Free para incentivar el upgrade
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface PremiumBenefitsCardProps {
  onUpgrade: () => void;
}

// Lista de beneficios del plan Premium
const PREMIUM_BENEFITS = [
  'Estadísticas detalladas ilimitadas',
  'Filtros de búsqueda avanzados',
  'Recompensas exclusivas Premium',
  'Soporte prioritario',
  'Sin publicidad',
];

export const PremiumBenefitsCard: React.FC<PremiumBenefitsCardProps> = ({
  onUpgrade,
}) => {
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
      <View className="flex-row items-center gap-3 mb-4">
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(147, 51, 234, 0.25)' : 'rgba(147, 51, 234, 0.2)',
            borderColor: isDark ? 'rgba(196, 181, 253, 0.4)' : 'rgba(147, 51, 234, 0.25)',
          }}
        >
          <Ionicons
            name="gift"
            size={22}
            color={isDark ? '#E9D5FF' : '#9333EA'}
          />
        </View>
        <Text
          className="text-lg font-bold flex-1"
          style={{ color: isDark ? '#F9FAFB' : '#111827' }}
        >
          Beneficios Premium
        </Text>
      </View>

      <Text
        className="mb-4 text-[13px] font-medium leading-[18px]"
        style={{ color: isDark ? '#C4B5FD' : '#7C3AED' }}
      >
        Desbloqueá todas las funcionalidades premium
      </Text>

      {PREMIUM_BENEFITS.map((benefit, index) => (
        <View key={index} className="flex-row items-center gap-2 mb-3">
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={isDark ? '#C4B5FD' : '#7C3AED'}
          />
          <Text
            className="text-[13px] font-medium flex-1"
            style={{ color: isDark ? '#C4B5FD' : '#7C3AED' }}
          >
            {benefit}
          </Text>
        </View>
      ))}

      <TouchableOpacity
        className="mt-4 py-3.5 rounded-2xl items-center"
        style={{ backgroundColor: isDark ? '#7C3AED' : '#9333EA', opacity: 0.5 }}
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
  );
};
