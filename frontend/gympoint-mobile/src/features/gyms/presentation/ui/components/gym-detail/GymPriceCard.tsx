import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { InfoCard } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

interface GymPriceCardProps {
  price: number;
}

export function GymPriceCard({ price }: GymPriceCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <InfoCard variant="default" className="mx-4 mt-4">
      <View className="flex-row items-center justify-between">
        {/* Left Column */}
        <View className="flex-row items-center flex-1">
          <View
            className="w-14 h-14 rounded-[20px] border items-center justify-center mr-4"
            style={{
              backgroundColor: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.16)',
              borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
            }}
          >
            <Feather name="dollar-sign" size={22} color={isDark ? '#C7D2FE' : '#4338CA'} />
          </View>
          <View className="flex-1">
            <Text
              className="text-[13px] font-semibold uppercase mb-1.5"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.3 }}
            >
              Precio mensual
            </Text>
            <Text
              className="text-[26px] font-bold"
              style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
            >
              ${price.toLocaleString('es-AR')}
            </Text>
          </View>
        </View>

        {/* Badge */}
        <View
          className="px-4 py-2 rounded-[18px] border"
          style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.16)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.32)',
          }}
        >
          <Text
            className="text-xs font-bold uppercase"
            style={{
              color: isDark ? '#6EE7B7' : '#047857',
              letterSpacing: 0.5,
            }}
          >
            Por mes
          </Text>
        </View>
      </View>
    </InfoCard>
  );
}
