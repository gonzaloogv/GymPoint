import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface GymDetailHeaderProps {
  gymName: string;
  onBack: () => void;
}

export function GymDetailHeader({ gymName, onBack }: GymDetailHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className="flex-row items-center px-4 pt-[18px] pb-3">
      <Pressable onPress={onBack} hitSlop={12} className="p-1 mr-3">
        <Ionicons name="chevron-back" size={26} color={isDark ? '#60A5FA' : '#4338CA'} />
      </Pressable>
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

