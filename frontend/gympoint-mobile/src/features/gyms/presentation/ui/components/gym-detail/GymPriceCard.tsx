import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

interface GymPriceCardProps {
  price: number;
}

export function GymPriceCard({ price }: GymPriceCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card className="mx-4 mt-4 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className={`w-12 h-12 rounded-lg justify-center items-center mr-4 ${isDark ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
          <Feather name="dollar-sign" size={24} color={isDark ? '#60a5fa' : '#3b82f6'} />
        </View>
        <View>
          <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            Precio mensual
          </Text>
          <Text className={`text-2xl font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
            ${price.toLocaleString('es-AR')}
          </Text>
        </View>
      </View>
      <View className="bg-green-500/20 border border-green-500/40 rounded-2xl px-3 py-1">
        <Text className="text-xs font-semibold text-green-600">Por mes</Text>
      </View>
    </Card>
  );
}
