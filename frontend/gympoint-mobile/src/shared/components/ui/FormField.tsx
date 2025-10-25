import { useTheme } from '@shared/hooks';
import React from 'react';
import { View, Text } from 'react-native';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
  className = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-text-dark' : 'text-text';

  return (
    <View className={`w-full mb-4 ${className}`}>
      <Text className={`text-sm font-medium ${textColor} mb-2`}>{label}</Text>
      {children}
      {error && <Text className="text-sm text-error mt-1">{error}</Text>}
    </View>
  );
};

export const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text className="text-sm text-error mt-2 text-center">{children}</Text>
);