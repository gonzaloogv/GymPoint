import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightComponent?: React.ReactNode;
};

export function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightComponent,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 border-b"
      style={{
        borderColor: isDark ? '#2C3444' : '#DDDDDD',
      }}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <Ionicons name={icon} size={18} color={isDark ? '#B0B8C8' : '#666'} />
        <Text className={`text-base font-medium ${isDark ? 'text-text-dark' : 'text-text'}`}>
          {title}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {subtitle && (
          <Text className="text-xs opacity-60" style={{ color: isDark ? '#B0B8C8' : '#666' }}>
            {subtitle}
          </Text>
        )}
        {rightComponent}
        {showChevron && (
          <Ionicons name="chevron-forward" size={16} color={isDark ? '#B0B8C8' : '#666'} />
        )}
      </View>
    </TouchableOpacity>
  );
}
