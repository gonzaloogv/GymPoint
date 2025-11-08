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

  return (
    <View className="flex-row items-start justify-between py-5 mb-5">
      <View className="flex-shrink gap-1">
        <Text
          className="text-2xl font-bold"
          style={{ color: isDark ? '#F9FAFB' : '#111827' }}
        >
          Recompensas
        </Text>
        <Text
          className="text-sm"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        >
          Canjeá tus tokens por beneficios
        </Text>
      </View>
      <View
        className="items-end rounded-[24px] p-4 border"
        style={{
          backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
          borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
        }}
      >
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="flash" size={18} color="#FACC15" />
          <Text className="text-xl font-bold" style={{ color: '#FACC15' }}>
            {user.tokens}
          </Text>
        </View>
        <Text
          className="text-xs text-right mt-0.5 font-medium"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        >
          tokens disponibles
        </Text>
      </View>
    </View>
  );
};
