import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@features/auth/domain/entities/User';
import { useTheme } from '@shared/hooks';

type RewardsHeaderProps = {
  user: User;
};

export const RewardsHeader: React.FC<RewardsHeaderProps> = ({ user }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgSecondary = isDark ? '#1f2937' : '#f3f4f6';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <View className="flex-row items-start justify-between py-5 mb-5">
      <View className="flex-shrink gap-1">
        <Text className="text-2xl font-bold" style={{ color: textColor }}>
          Recompensas
        </Text>
        <Text className="text-sm" style={{ color: subtextColor }}>
          Canjeá tus tokens por beneficios
        </Text>
      </View>
      <View
        className="items-end rounded-xl p-4 border"
        style={{ backgroundColor: bgSecondary, borderColor }}
      >
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="flash" size={18} color="#facc15" />
          <Text className="text-xl font-bold" style={{ color: '#facc15' }}>
            {user.tokens}
          </Text>
        </View>
        <Text className="text-xs text-right mt-0.5 font-medium" style={{ color: subtextColor }}>
          tokens disponibles
        </Text>
      </View>
    </View>
  );
};
