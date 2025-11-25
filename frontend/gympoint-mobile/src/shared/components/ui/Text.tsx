import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useTheme } from '@shared/hooks';

interface CustomTextProps extends TextProps {
  children: React.ReactNode;
}

export function H1({ children, style, ...props }: CustomTextProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <RNText
      {...props}
      style={[
        {
          color: isDark ? '#ffffff' : '#000000',
          fontSize: 32,
          fontWeight: '700',
          marginBottom: 16,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

export function Body({ children, style, ...props }: CustomTextProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <RNText
      {...props}
      style={[
        {
          color: isDark ? '#ffffff' : '#000000',
          fontSize: 16,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

export function Subtle({ children, style, ...props }: CustomTextProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <RNText
      {...props}
      style={[
        {
          color: isDark ? '#9ca3af' : '#6b7280',
          fontSize: 16,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

export function RegisterText({ children, style, ...props }: CustomTextProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <RNText
      {...props}
      style={[
        {
          color: isDark ? '#ffffff' : '#000000',
          fontSize: 14,
          marginBottom: 24,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

export function RegisterLink({ children, style, ...props }: CustomTextProps) {
  return (
    <RNText
      {...props}
      style={[
        {
          color: '#3B82F6',
          textDecorationLine: 'underline',
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

export function ErrorText({ children, style, ...props }: CustomTextProps) {
  return (
    <RNText
      {...props}
      style={[
        {
          marginTop: 6,
          color: '#ef4444',
          fontSize: 16,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
