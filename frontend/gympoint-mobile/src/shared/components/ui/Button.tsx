import { useTheme } from '@shared/hooks';
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleProp, ViewStyle, StyleSheet } from 'react-native';


type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  className = '',
  style,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const baseClasses = 'rounded-xl flex-row items-center justify-center';

  const variantClasses = {
    primary: 'bg-primary',
    secondary: isDark
      ? 'bg-surface-dark border-2 border-border-dark'
      : 'bg-surface border-2 border-border',
    outline: 'bg-transparent border-2 border-primary',
    ghost: 'bg-transparent',
    danger: 'bg-error',
  };

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-5',
  };

  const textVariantClasses = {
    primary: 'text-onPrimary',
    secondary: isDark ? 'text-text-dark' : 'text-text',
    outline: 'text-primary',
    ghost: 'text-primary',
    danger: 'text-onError',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50' : '';

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${disabledClass}
    ${className}
  `.trim();

  const textClasses = `
    ${textVariantClasses[variant]}
    ${textSizeClasses[size]}
    font-semibold
  `.trim();

  const spinnerColor = variant === 'primary' || variant === 'danger'
    ? '#FFFFFF'
    : '#4A9CF5';

  const computedStyle = StyleSheet.flatten([style]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={buttonClasses}
      style={computedStyle}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <View className="flex-row items-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={textClasses}>{children}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const ButtonText = Text;