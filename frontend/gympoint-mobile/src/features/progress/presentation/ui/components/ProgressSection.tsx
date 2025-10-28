import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Ionicons } from '@expo/vector-icons';

interface ProgressSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

export function ProgressSection({ icon, title, description, onPress }: ProgressSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      className={`mx-4 p-4 rounded-xl mb-3 flex-row items-center justify-between ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      <View className="flex-row items-center flex-1">
        <View className="mr-4">{icon}</View>
        <View className="flex-1">
          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </Text>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={isDark ? '#9CA3AF' : '#6B7280'}
      />
    </Pressable>
  );
}
