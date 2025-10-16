import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme as useAppTheme } from 'styled-components/native';

import { LoginScreen, RegisterScreen, useAuthStore } from '@features/auth';
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

  const screenOptions = {
    headerShown: false,
    contentStyle: { backgroundColor: theme.colors.bg },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        {user ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
