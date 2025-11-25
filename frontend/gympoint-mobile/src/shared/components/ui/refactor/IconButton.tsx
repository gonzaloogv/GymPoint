import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  className?: string;
}

export function IconButton({
  icon,
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: IconButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getVariantClasses = () => {
    const variants = {
      primary: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
      secondary: isDark ? 'bg-gray-700' : 'bg-gray-200',
      ghost: 'bg-transparent',
      danger: isDark ? 'bg-red-900/30' : 'bg-red-50',
    };
    return variants[variant];
  };

  const getIconColor = () => {
    const colors = {
      primary: isDark ? '#60A5FA' : '#3B82F6',
      secondary: isDark ? '#9CA3AF' : '#6B7280',
      ghost: isDark ? '#9CA3AF' : '#6B7280',
      danger: isDark ? '#F87171' : '#EF4444',
    };
    return colors[variant];
  };

  const getTextColor = () => {
    const textColors = {
      primary: isDark ? 'text-blue-400' : 'text-blue-600',
      secondary: isDark ? 'text-gray-300' : 'text-gray-700',
      ghost: isDark ? 'text-gray-400' : 'text-gray-600',
      danger: isDark ? 'text-red-400' : 'text-red-600',
    };
    return textColors[variant];
  };

  const getIconSize = () => {
    const sizes = { sm: 14, md: 16, lg: 20 };
    return sizes[size];
  };

  const getPaddingClasses = () => {
    const paddings = {
      sm: 'px-2 py-1',
      md: 'px-3 py-2',
      lg: 'px-4 py-3',
    };
    return paddings[size];
  };

  const getTextSize = () => {
    const textSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };
    return textSizes[size];
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center rounded-lg ${getPaddingClasses()} ${getVariantClasses()} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
    >
      <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
      {label && (
        <Text className={`ml-1 font-semibold ${getTextColor()} ${getTextSize()}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
