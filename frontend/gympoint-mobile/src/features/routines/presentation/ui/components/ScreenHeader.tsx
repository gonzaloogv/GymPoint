import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type Props = {
  title: string;
  onBack: () => void;
};

export function ScreenHeader({ title, onBack }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const iconColor = isDark ? '#E5E7EB' : '#334155';

  return (
    <View
      className={`flex-row items-center px-4 py-3.5 border-b ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}
      style={{
        borderBottomColor: isDark ? 'rgba(55, 65, 81, 0.4)' : 'rgba(148, 163, 184, 0.28)',
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-2xl items-center justify-center mr-3 border"
        style={{ borderColor: 'rgba(148, 163, 184, 0.25)' }}
      >
        <Ionicons name="arrow-back" size={20} color={iconColor} />
      </TouchableOpacity>
      <Text
        numberOfLines={1}
        className="flex-1 text-lg font-bold"
        style={{ color: isDark ? '#F9FAFB' : '#111827' }}
      >
        {title}
      </Text>
    </View>
  );
}
