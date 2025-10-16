import { useTheme } from '@shared/hooks';
import React from 'react';
import { View, Text } from 'react-native';

interface DividerProps {
  text?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ text, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const lineColor = isDark ? 'bg-divider-dark' : 'bg-divider';
  const textColor = isDark ? 'text-textSecondary-dark' : 'text-textSecondary';

  if (text) {
    return (
      <View className={`flex-row items-center my-6 ${className}`}>
        <View className={`flex-1 h-[1px] ${lineColor}`} />
        <Text className={`mx-4 text-sm ${textColor}`}>{text}</Text>
        <View className={`flex-1 h-[1px] ${lineColor}`} />
      </View>
    );
  }

  return <View className={`h-[1px] ${lineColor} ${className}`} />;
};