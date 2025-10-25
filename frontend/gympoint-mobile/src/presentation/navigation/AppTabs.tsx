// src/presentation/navigation/AppTabs.tsx
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@shared/hooks';
import { TabPill } from '@shared/components/ui/TabPill';

import WorkoutIcon from '@assets/icons/workout.svg';
import HomeIcon from '@assets/icons/home.svg';
import MapIcon from '@assets/icons/map.svg';
import StoreIcon from '@assets/icons/gift.svg';
import UserIcon from '@assets/icons/user.svg';
import { useAuthStore } from '@features/auth';
import { GymsScreen } from '@features/gyms';
import { GymDetailScreenWrapper } from '@features/gyms/presentation/ui/screens/GymDetailScreenWrapper';
import { HomeScreen } from '@features/home';
import { RewardsScreen } from '@features/rewards';
import { UserProfileScreen } from '@features/user';
import {
  RoutineDetailScreen,
  RoutineExecutionScreen,
  RoutineHistoryScreen,
  RoutinesScreen,
  CreateRoutineScreen,
  ImportRoutineScreen,
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
        name="CreateRoutine"
        component={CreateRoutineScreen}
        options={{ headerShown: false }}
      />
      <RoutinesStack.Screen
        name="ImportRoutine"
        component={ImportRoutineScreen}
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
  const { theme, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const updateUser = useAuthStore((s) => s.updateUser);

  const ITEM_MIN_WIDTH = 72;
  const primary10 = isDark ? '#635BFF1A' : '#635BFF1A';

  const insets = useSafeAreaInsets();
  const TAB_BASE_HEIGHT = 64;

  const renderTabPill = (focused: boolean, children: React.ReactNode, label: string) => (
    <TabPill
      focused={focused}
      label={label}
      primaryColor={isDark ? '#635BFF' : '#635BFF'}
      textMuted={isDark ? '#9CA3AF' : '#6B7280'}
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
      <UserProfileScreen user={user} onUpdateUser={updateUser} onLogout={handleLogout} />
    ),
    [user, updateUser, handleLogout],
  );

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
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
            renderTabPill(
              focused,
              <TabIcon
                source={HomeIcon}
                size={size}
                color={focused ? '#635BFF' : (isDark ? '#9CA3AF' : '#6B7280')}
              />,
              'Inicio',
            ),
        }}
      />

      {/* Cambiamos el tab de Rutinas para usar el stack */}
      <Tabs.Screen
        name="Rutinas"
        component={RoutinesStackNavigator}
        options={{
          tabBarIcon: ({ focused, size = 20 }) =>
            renderTabPill(
              focused,
              <TabIcon
                source={WorkoutIcon}
                size={size}
                color={focused ? '#635BFF' : (isDark ? '#9CA3AF' : '#6B7280')}
              />,
              'Rutinas',
            ),
        }}
      />

      <Tabs.Screen
        name="Mapa"
        component={GymsStackNavigator}
        options={{
          tabBarIcon: ({ focused, size = 20 }) =>
            renderTabPill(
              focused,
              <TabIcon
                source={MapIcon}
                size={size}
                color={focused ? '#635BFF' : (isDark ? '#9CA3AF' : '#6B7280')}
              />,
              'Mapa',
            ),
        }}
      />

      <Tabs.Screen
        name="Recompensa"
        children={renderRewardsScreen}
        options={{
          tabBarIcon: ({ focused, size = 20 }) =>
            renderTabPill(
              focused,
              <TabIcon
                source={StoreIcon}
                size={size}
                color={focused ? '#635BFF' : (isDark ? '#9CA3AF' : '#6B7280')}
              />,
              'Tienda',
            ),
        }}
      />

      <Tabs.Screen
        name="Usuario"
        children={renderUserProfileScreen}
        options={{
          tabBarIcon: ({ focused, size = 20 }) =>
            renderTabPill(
              focused,
              <TabIcon
                source={UserIcon}
                size={size}
                color={focused ? '#635BFF' : (isDark ? '#9CA3AF' : '#6B7280')}
              />,
              'Perfil',
            ),
        }}
      />
    </Tabs.Navigator>
  );
}
