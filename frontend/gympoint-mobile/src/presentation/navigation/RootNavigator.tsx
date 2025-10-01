import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme as useAppTheme } from 'styled-components/native';

import { LoginScreen, useAuthStore } from '@features/auth';

import AppTabs from './AppTabs';
import { useNavigationTheme } from './navTheme';

const Stack = createNativeStackNavigator();

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

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        {user ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
