/**
 * PremiumBenefitsCard - Card que muestra los beneficios del plan Premium
 * Se muestra solo a usuarios con plan Free para incentivar el upgrade
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { palette } from '@shared/styles';

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

  return (
    <View
      className="rounded-lg p-4 mb-4 border"
      style={{
        backgroundColor: palette.premiumSurface,
        borderColor: palette.premiumBorder,
      }}
    >
      <View className="flex-row items-center mb-3">
        <Feather name="gift" size={20} color={palette.premiumStrong} />
        <Text
          className="ml-2 font-bold text-lg"
          style={{ color: palette.premiumStrong }}
        >
          Beneficios Premium
        </Text>
      </View>

      <Text
        className="mb-3 text-sm"
        style={{ color: palette.premiumText }}
      >
        Desbloqueá todas las funcionalidades premium
      </Text>

      {PREMIUM_BENEFITS.map((benefit, index) => (
        <View key={index} className="flex-row items-center mb-2">
          <Feather name="check" size={16} color={palette.premiumStrong} />
          <Text
            className="ml-2 text-sm flex-1"
            style={{ color: palette.premiumText }}
          >
            {benefit}
          </Text>
        </View>
      ))}

      <TouchableOpacity
        className="mt-4 rounded-lg py-3 items-center justify-center"
        style={{ backgroundColor: '#9333EA' }}
        onPress={onUpgrade}
      >
        <Text className="font-semibold text-white">Actualizar a Premium</Text>
      </TouchableOpacity>
    </View>
  );
};
