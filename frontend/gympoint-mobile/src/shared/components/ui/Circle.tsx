import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@shared/hooks';

type CircleProps = ViewProps & {
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  children?: React.ReactNode;
};

export function Circle({
  size = 40,
  backgroundColor,
  borderColor,
  children,
  style,
  ...props
}: CircleProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const defaultBg = isDark ? '#1f2937' : '#ffffff';
  const bgColor = backgroundColor ?? defaultBg;

  return (
    <View
      {...props}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          ...(borderColor && {
            borderWidth: 1,
            borderColor: borderColor,
          }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
