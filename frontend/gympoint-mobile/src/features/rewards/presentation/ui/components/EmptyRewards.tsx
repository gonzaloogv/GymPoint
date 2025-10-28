import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Card } from '@shared/components/ui';

export const EmptyRewards: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card>
      <View className="items-center py-8">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
          }}
        >
          <Ionicons name="gift-outline" size={32} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </View>
        <Text
          className="text-lg font-semibold mb-2"
          style={{ color: isDark ? '#F9FAFB' : '#111827' }}
        >
          No hay recompensas actualmente
        </Text>
        <Text
          className="text-center text-sm px-4"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        >
          Todavía no hay recompensas disponibles. Seguí acumulando tokens para cuando estén listas.
        </Text>
      </View>
    </Card>
  );
};
