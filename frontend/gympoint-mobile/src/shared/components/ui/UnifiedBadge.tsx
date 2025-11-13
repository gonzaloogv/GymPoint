import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Feather } from '@expo/vector-icons';

type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconColor?: string;
  iconSize?: number;
};

const getVariantStyles = (
  variant: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger',
  isDark: boolean
) => {
  switch (variant) {
    case 'primary':
      return { bg: '#4A9CF5', border: '#4A9CF5', text: '#FFFFFF', icon: '#FFFFFF' };
    case 'outline':
      return {
        bg: 'transparent',
        border: isDark ? '#4B5563' : '#DDDDDD',
        text: isDark ? '#E5E7EB' : '#1A1A1A',
        icon: isDark ? '#E5E7EB' : '#1A1A1A',
      };
    case 'success':
      return { bg: '#4CAF50', border: '#4CAF50', text: '#FFFFFF', icon: '#FFFFFF' };
    case 'warning':
      return { bg: '#FF9800', border: '#FF9800', text: '#FFFFFF', icon: '#FFFFFF' };
    case 'danger':
      return { bg: '#F44336', border: '#F44336', text: '#FFFFFF', icon: '#FFFFFF' };
    default: // secondary
      return {
        bg: isDark ? '#374151' : '#f3f4f6',
        border: isDark ? '#4B5563' : '#DDDDDD',
        text: isDark ? '#E5E7EB' : '#1A1A1A',
        icon: isDark ? '#9CA3AF' : '#666666',
      };
  }
};

const getPadding = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return 'px-1.5 py-0.5';
    case 'large':
      return 'px-4 py-2';
    default:
      return 'px-2 py-1';
  }
};

const getFontSize = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return 'text-xs';
    case 'large':
      return 'text-base';
    default:
      return 'text-sm';
  }
};

export function UnifiedBadge({
  children,
  variant = 'secondary',
  size = 'medium',
  icon,
  iconColor,
  iconSize = 12,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getVariantStyles(variant, isDark);
  const paddingClass = getPadding(size);
  const fontClass = getFontSize(size);
  const finalIconColor = iconColor || styles.icon;

  return (
    <View
      className={`flex-row items-center rounded-lg border gap-1 ${paddingClass}`}
      style={{ backgroundColor: styles.bg, borderColor: styles.border }}
    >
      {icon && <Feather name={icon as any} size={iconSize} color={finalIconColor} />}
      <Text className={`font-semibold ${fontClass}`} style={{ color: styles.text }}>
        {children}
      </Text>
    </View>
  );
}
