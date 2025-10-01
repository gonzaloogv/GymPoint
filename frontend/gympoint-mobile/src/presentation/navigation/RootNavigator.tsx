import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme as useAppTheme } from 'styled-components/native';
import { NavigationLayout, StackNavigator } from '@shared/components/ui';

import { LoginScreen, useAuthStore } from '@features/auth';
import AppTabs from './AppTabs';
import { useNavigationTheme } from './navTheme';

export default function RootNavigator() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);

  const navTheme = useNavigationTheme({
    bg: theme.colors.bg,
    card: theme.colors.card,
    text: theme.colors.text,
    primary: theme.colors.primary,
    border: theme.colors.border,
    danger: theme.colors.danger,
  });

  const screens = user 
    ? [{ name: 'App', component: AppTabs, options: {} }]
    : [{ name: 'Login', component: LoginScreen, options: {} }];

  const screenOptions = {
    headerShown: false,
    contentStyle: { backgroundColor: theme.colors.bg },
  };

  return (
    <NavigationLayout theme={navTheme}>
      <StackNavigator screens={screens} screenOptions={screenOptions} />
    </NavigationLayout>
  );
}
