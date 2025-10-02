import React from 'react';
import { useTheme as useAppTheme } from 'styled-components/native';
import { NavigationLayout, StackNavigator } from '@shared/components/ui';

import { LoginScreen, RegisterScreen, useAuthStore } from '@features/auth'; // 👈 agrego RegisterScreen
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

  // 👇 Si hay usuario -> App
  //    Si no hay usuario -> Login + Register
  const screens = user
    ? [
        { name: 'App', component: AppTabs, options: {} },
      ]
    : [
        { name: 'Login', component: LoginScreen, options: {} },
        { name: 'Register', component: RegisterScreen, options: {} },
      ];

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
