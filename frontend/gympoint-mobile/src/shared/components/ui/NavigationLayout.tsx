import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useTheme as useAppTheme } from 'styled-components/native';

type Props = {
  children: React.ReactNode;
  theme?: any;
};

export function NavigationLayout({ children, theme }: Props) {
  const appTheme = useAppTheme();
  
  const defaultTheme = {
    dark: false,
    colors: {
      primary: appTheme.colors.primary,
      background: appTheme.colors.bg,
      card: appTheme.colors.card,
      text: appTheme.colors.text,
      border: appTheme.colors.border,
      notification: appTheme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={theme || defaultTheme}>
      {children}
    </NavigationContainer>
  );
}
