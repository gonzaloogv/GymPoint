// src/presentation/navigation/AppTabs.tsx
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme as useAppTheme } from 'styled-components/native';
import { TabPill } from '@shared/components/ui';

import WorkoutIcon from '@assets/icons/workout.svg';
import HomeIcon from '@assets/icons/home.svg';
import MapIcon from '@assets/icons/map.svg';
import StoreIcon from '@assets/icons/gift.svg';
import UserIcon from '@assets/icons/user.svg';
import { useAuthStore } from '@features/auth';
import { GymsScreen } from '@features/gyms';
import { GymDetailScreenWrapper } from '@features/gymdetails/ui/GymDetailScreenWrapper';
import { HomeScreen } from '@features/home';
import { RewardsScreen } from '@features/rewards';
import { UserProfileScreen } from '@features/user';
import {
  RoutineDetailScreen,
  RoutineExecutionScreen,
  RoutineHistoryScreen,
  RoutinesScreen,
} from '@features/routines';

import { TabIcon } from './components/TabIcon';
import type { RoutinesStackParamList, GymsStackParamList } from './types';

const Tabs = createBottomTabNavigator();

// ====== Routines nested stack ======
const RoutinesStack = createNativeStackNavigator<RoutinesStackParamList>();

function RoutinesStackNavigator() {
  return (
    <RoutinesStack.Navigator>
      <RoutinesStack.Screen
        name="RoutinesList"
        component={RoutinesScreen}
        options={{ headerShown: false }}
      />
      <RoutinesStack.Screen
        name="RoutineDetail"
        component={RoutineDetailScreen}
        options={{ title: 'Detalle de rutina' }}
      />
      <RoutinesStack.Screen
        name="RoutineHistory"
        component={RoutineHistoryScreen}
        options={{ title: 'Historial' }}
      />
      <RoutinesStack.Screen
        name="RoutineExecution"
        component={RoutineExecutionScreen}
        options={{ title: 'Ejecución' }}
      />
    </RoutinesStack.Navigator>
  );
}

// ====== Gyms nested stack ======
const GymsStack = createNativeStackNavigator<GymsStackParamList>();

function GymsStackNavigator() {
  return (
    <GymsStack.Navigator>
      <GymsStack.Screen
        name="GymsList"
        component={GymsScreen}
        options={{ headerShown: false }}
      />
      <GymsStack.Screen
        name="GymDetail"
        component={GymDetailScreenWrapper}
        options={{ title: 'Detalle del gimnasio' }}
      />
    </GymsStack.Navigator>
  );
}


export default function AppTabs() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const updateUser = useAuthStore((s) => s.updateUser);

  const ITEM_MIN_WIDTH = 72;
  const primary10 = `${theme.colors.primary}1A`;

  const insets = useSafeAreaInsets();
  const TAB_BASE_HEIGHT = 64;

  const renderTabPill = (focused: boolean, children: React.ReactNode, label: string) => (
    <TabPill
      focused={focused}
      label={label}
      primaryColor={theme.colors.primary}
      textMuted={theme.colors.textMuted}
    >
      {children}
    </TabPill>
  );

  const renderRewardsScreen = React.useCallback(
    () => <RewardsScreen user={user} onUpdateUser={updateUser} />,
    [user, updateUser],
  );

  const handleLogout = React.useCallback(() => {
    setUser(null);
  }, [setUser]);

  const renderUserProfileScreen = React.useCallback(
    () => (
      <UserProfileScreen
        user={user}
        onUpdateUser={updateUser}
        onLogout={handleLogout}
      />
    ),
    [user, updateUser, handleLogout],
  );

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          elevation: 0,
          height: TAB_BASE_HEIGHT + insets.bottom,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarIconStyle: {
          width: ITEM_MIN_WIDTH,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tabs.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, size = 20 }) => 
            renderTabPill(focused, 
              <TabIcon
                source={HomeIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />, 
              "Inicio"
            ),
        }}
      />

      {/* Cambiamos el tab de Rutinas para usar el stack */}
      <Tabs.Screen
        name="Rutinas"
        component={RoutinesStackNavigator}
        options={{
          tabBarIcon: ({ focused, size = 20 }) => 
            renderTabPill(focused, 
              <TabIcon
                source={WorkoutIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />, 
              "Rutinas"
            ),
        }}
      />

      <Tabs.Screen
        name="Mapa"
        component={GymsStackNavigator}
        options={{
          tabBarIcon: ({ focused, size = 20 }) => 
            renderTabPill(focused, 
              <TabIcon
                source={MapIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />, 
              "Mapa"
            ),
        }}
      />

      <Tabs.Screen
        name="Recompensa"
        children={renderRewardsScreen}
        options={{
          tabBarIcon: ({ focused, size = 20 }) => 
            renderTabPill(focused, 
              <TabIcon
                source={StoreIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />, 
              "Tienda"
            ),
        }}
      />

      <Tabs.Screen
        name="Usuario"
        children={renderUserProfileScreen}
        options={{
          tabBarIcon: ({ focused, size = 20 }) => 
            renderTabPill(focused, 
              <TabIcon
                source={UserIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />, 
              "Perfil"
            ),
        }}
      />
    </Tabs.Navigator>
  );
}
