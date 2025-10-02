import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../../features/auth/ui/LoginScreen';
import RegisterScreen from '../../features/auth/ui/RegisterScreen';
import HomeScreen from '../../features/gyms/ui/HomeScreen';
import MapScreen from '../../features/gyms/ui/MapScreen';
import ProfileScreen from '../../features/auth/ui/ProfileScreen';
import AdminScreen from '../../features/admin/ui/AdminScreen';

// 👉 Tipamos los param lists para evitar inferencias raras
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Admin: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Map: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

function TabsRoot() {
  return (
    <Tabs.Navigator
      id={undefined}                 // 👈 fix del error de tipos
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Map" component={MapScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer
      theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#F7F7FB' } }}
    >
      <Stack.Navigator
        id={undefined}               // 👈 fix del error de tipos
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={TabsRoot} />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
