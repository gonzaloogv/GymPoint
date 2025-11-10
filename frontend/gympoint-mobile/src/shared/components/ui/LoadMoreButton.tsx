import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type LoadMoreButtonProps = {
  onPress: () => void;
  remainingItems: number;
};

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onPress, remainingItems }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 24,
        elevation: 10,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 22,
        elevation: 5,
      };

  return (
    <Pressable
      onPress={onPress}
      className="py-3 px-4 rounded-2xl border"
      style={[
        {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row items-center justify-center gap-2">
        <Text className="text-sm font-semibold" style={{ color: isDark ? '#60A5FA' : '#3B82F6' }}>
          Ver más ({remainingItems} restantes)
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={isDark ? '#60A5FA' : '#3B82F6'}
        />
      </View>
    </Pressable>
  );
};
