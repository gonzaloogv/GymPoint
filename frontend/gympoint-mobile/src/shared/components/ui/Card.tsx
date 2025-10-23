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

  const baseClasses = `rounded-2xl ${isDark ? 'bg-surface-dark' : 'bg-surface'}`;

  const variantClasses = {
    default: '',
    elevated: 'shadow-lg',
    outlined: isDark ? 'border-2 border-border-dark' : 'border-2 border-border',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${className}
  `.trim();

  const computedStyle = StyleSheet.flatten([style]);

  return (
    <View className={cardClasses} style={computedStyle} {...props}>
      {children}
    </View>
  );
};