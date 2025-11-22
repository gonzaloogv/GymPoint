import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { BackButton } from '@shared/components/ui';

interface GymDetailHeaderProps {
  gymName: string;
  onBack: () => void;
}

export function GymDetailHeader({ gymName, onBack }: GymDetailHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className="flex-row items-center px-4 pt-[18px] pb-3">
      <BackButton onPress={onBack} label="" />
      <Text
        className={`flex-1 text-[26px] font-extrabold ${isDark ? 'text-gray-50' : 'text-gray-900'}`}
        style={{ letterSpacing: -0.3 }}
        numberOfLines={2}
      >
        {gymName}
      </Text>
    </View>
  );
}

