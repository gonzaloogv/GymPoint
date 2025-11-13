import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({ label, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getVariantClasses = () => {
    const variants = {
      primary: isDark ? 'bg-blue-900/30' : 'bg-blue-100',
      success: isDark ? 'bg-green-900/30' : 'bg-green-100',
      warning: isDark ? 'bg-yellow-900/30' : 'bg-yellow-100',
      danger: isDark ? 'bg-red-900/30' : 'bg-red-100',
      info: isDark ? 'bg-gray-700' : 'bg-gray-100',
      default: isDark ? 'bg-gray-800' : 'bg-gray-100',
    };
    return variants[variant];
  };

  const getTextVariantClasses = () => {
    const textVariants = {
      primary: isDark ? 'text-blue-400' : 'text-blue-700',
      success: isDark ? 'text-green-400' : 'text-green-700',
      warning: isDark ? 'text-yellow-400' : 'text-yellow-700',
      danger: isDark ? 'text-red-400' : 'text-red-700',
      info: isDark ? 'text-gray-300' : 'text-gray-700',
      default: isDark ? 'text-gray-300' : 'text-gray-700',
    };
    return textVariants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-2 py-0.5',
      md: 'px-3 py-1',
      lg: 'px-4 py-2',
    };
    return sizes[size];
  };

  const getTextSizeClasses = () => {
    const textSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };
    return textSizes[size];
  };

  return (
    <View className={`rounded-full ${getVariantClasses()} ${getSizeClasses()} ${className}`}>
      <Text className={`font-semibold ${getTextVariantClasses()} ${getTextSizeClasses()}`}>
        {label}
      </Text>
    </View>
  );
}
