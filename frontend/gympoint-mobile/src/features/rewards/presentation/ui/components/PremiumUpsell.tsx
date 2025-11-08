import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette } from '@shared/styles';

type PremiumUpsellProps = {
  onPress: () => void;
};

export const PremiumUpsell: React.FC<PremiumUpsellProps> = ({ onPress }) => (
  <View
    className="flex-row items-start gap-3 rounded-[24px] p-4 mb-4 border"
    style={{
      backgroundColor: palette.premiumSurface,
      borderColor: palette.premiumBorder,
      borderWidth: 1,
    }}
  >
    <Feather name="star" size={20} color={palette.premiumIcon} style={{ marginTop: 2 }} />
    <View className="flex-1 gap-2">
      <Text className="text-base font-semibold mb-1" style={{ color: palette.premiumStrong }}>
        ¿Querés más recompensas?
      </Text>
      <Text className="text-sm leading-5 mb-3" style={{ color: palette.premiumText }}>
        Actualizá a Premium y desbloqueá beneficios exclusivos.
      </Text>
      <TouchableOpacity
        onPress={onPress}
        className="px-4 py-3 rounded-2xl self-start"
        style={{ backgroundColor: palette.premiumPrimary }}
      >
        <Text className="font-semibold text-sm" style={{ color: '#F9FAFB' }}>
          Ver Premium →
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);
