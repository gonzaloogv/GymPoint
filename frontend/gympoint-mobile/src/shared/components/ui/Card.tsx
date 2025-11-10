import { useTheme } from '@shared/hooks';
import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

type CardVariant = 'default' | 'elevated' | 'outlined';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends Omit<ViewProps, 'children'> {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const borderColor = isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB';
  const backgroundColor = isDark ? '#111827' : '#ffffff';

  const baseClasses = `rounded-[28px] border`;

  const shadowStyle = variant === 'elevated'
    ? isDark
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
        }
    : isDark
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

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardClasses = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${className}
  `.trim();

  const computedStyle = StyleSheet.flatten([
    {
      borderColor,
      backgroundColor,
    },
    shadowStyle,
    style,
  ]);

  return (
    <View className={cardClasses} style={computedStyle} {...props}>
      {children}
    </View>
  );
};