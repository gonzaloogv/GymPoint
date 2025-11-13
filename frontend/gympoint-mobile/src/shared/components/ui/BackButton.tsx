import React from 'react';
import { Pressable, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type BackButtonProps = {
  onPress: () => void;
  label?: string;
};

export const BackButton: React.FC<BackButtonProps> = ({ onPress, label = 'Volver' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const iconColor = isDark ? '#E5E7EB' : '#334155';

  return (
    <View className="flex-row items-center -ml-2">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-2xl items-center justify-center mr-3 border"
        style={{ borderColor: 'rgba(148, 163, 184, 0.25)' }}
      >
        <Ionicons name="arrow-back" size={20} color={iconColor} />
      </TouchableOpacity>
      {label && (
        <Text
          className="text-lg font-bold"
          style={{ color: isDark ? '#F9FAFB' : '#111827' }}
        >
          {label}
        </Text>
      )}
    </View>
  );
};
