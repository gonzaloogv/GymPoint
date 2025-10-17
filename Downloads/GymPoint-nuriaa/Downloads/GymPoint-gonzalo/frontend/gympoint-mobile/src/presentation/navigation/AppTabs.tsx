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
import UserIcon from '@assets/icons/user.svg';
import ChartIcon from '@assets/icons/chart.svg';
import { useAuthStore } from '@features/auth';
import { GymsScreen } from '@features/gyms';
import { GymDetailScreenWrapper } from '@features/gyms/presentation/ui/screens/GymDetailScreenWrapper';
import { HomeScreen } from '@features/home';
import { ProgressScreen, PhysicalProgressScreen, ExerciseProgressScreen, AchievementsScreen, TokenHistoryScreen } from '@features/progress';
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
import type { RoutinesStackParamList, GymsStackParamList, ProgressStackParamList, UserStackParamList } from './types';

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

// ====== Progress nested stack ======
const ProgressStack = createNativeStackNavigator<ProgressStackParamList>();

function ProgressStackNavigator() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  return (
    <ProgressStack.Navigator>
      <ProgressStack.Screen
        name="ProgressMain"
        component={ProgressScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen
        name="PhysicalProgress"
        component={PhysicalProgressScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen
        name="ExerciseProgress"
        component={ExerciseProgressScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen
        name="Rewards"
        options={{ headerShown: false }}
      >
        {() => <RewardsScreen user={user} onUpdateUser={updateUser} />}
      </ProgressStack.Screen>
    </ProgressStack.Navigator>
  );
}

// ====== User nested stack ======
const UserStack = createNativeStackNavigator<UserStackParamList>();

function UserStackNavigator() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogout = React.useCallback(() => {
    setUser(null);
  }, [setUser]);

  return (
    <UserStack.Navigator>
      <UserStack.Screen
        name="UserProfile"
        options={{ headerShown: false }}
      >
        {({ navigation }) => (
          <UserProfileScreen
            user={user}
            onUpdateUser={updateUser}
            onLogout={handleLogout}
            navigation={navigation}
          />
        )}
      </UserStack.Screen>
      <UserStack.Screen
        name="TokenHistory"
        component={TokenHistoryScreen}
        options={{ headerShown: false }}
      />
      <UserStack.Screen
        name="Rewards"
        options={{ headerShown: false }}
      >
        {() => <RewardsScreen user={user} onUpdateUser={updateUser} />}
      </UserStack.Screen>
    </UserStack.Navigator>
  );
}

export default function AppTabs() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const ITEM_MIN_WIDTH = 72;
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
            renderTabPill(
              focused,
              <TabIcon
                source={HomeIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
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
                color={focused ? theme.colors.primary : theme.colors.textMuted}
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
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />,
              'Mapa',
            ),
        }}
      />

      <Tabs.Screen
        name="Progreso"
        component={ProgressStackNavigator}
        options={{
          tabBarIcon: ({ focused, size = 20 }) =>
            renderTabPill(
              focused,
              <TabIcon
                source={ChartIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />,
              'Progreso',
            ),
        }}
      />

      <Tabs.Screen
        name="Usuario"
        component={UserStackNavigator}
        options={{
          tabBarIcon: ({ focused, size = 20 }) =>
            renderTabPill(
              focused,
              <TabIcon
                source={UserIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />,
              'Perfil',
            ),
        }}
      />
    </Tabs.Navigator>
  );
}
