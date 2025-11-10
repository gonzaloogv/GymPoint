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
import UserIcon from '@assets/icons/user.svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@features/auth';
import { GymsScreen } from '@features/gyms';
import { GymDetailScreenWrapper } from '@features/gyms/presentation/ui/screens/GymDetailScreenWrapper';
import { HomeScreen } from '@features/home';
import { UserProfileScreen } from '@features/user';
import { userStorage } from '@shared/services/storage';
import {
  RoutineDetailScreen,
  RoutineExecutionScreen,
  RoutineHistoryScreen,
  RoutinesScreen,
  RoutinesScreenWrapper,
  RoutineCompletedScreen,
  CreateRoutineScreen,
  ImportRoutineScreen,
  TemplateDetailScreen,
} from '@features/routines';
import {
  ProgressScreen,
  PhysicalProgressScreen,
  ExerciseProgressScreen,
  AchievementsScreen,
} from '@features/progress/presentation/ui/screens';

import { TabIcon } from './components/TabIcon';
import type { RoutinesStackParamList, GymsStackParamList, ProgressStackParamList } from './types';

const Tabs = createBottomTabNavigator();

// ====== Routines nested stack ======
const RoutinesStack = createNativeStackNavigator<RoutinesStackParamList>();

function RoutinesStackNavigator() {
  return (
    <RoutinesStack.Navigator>
      <RoutinesStack.Screen
        name="RoutinesList"
        component={RoutinesScreenWrapper}
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
        name="TemplateDetail"
        component={TemplateDetailScreen}
        options={{ headerShown: false }}
      />
      <RoutinesStack.Screen
        name="RoutineDetail"
        component={RoutineDetailScreen}
        options={{ headerShown: false }}
      />
      <RoutinesStack.Screen
        name="RoutineHistory"
        component={RoutineHistoryScreen}
        options={{ headerShown: false }}
      />
      <RoutinesStack.Screen
        name="RoutineExecution"
        component={RoutineExecutionScreen}
        options={{ headerShown: false }}
      />
      <RoutinesStack.Screen
        name="RoutineCompleted"
        component={RoutineCompletedScreen}
        options={{ headerShown: false }}
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
        options={{ headerShown: false }}
      />
    </GymsStack.Navigator>
  );
}

// ====== Progress nested stack ======
const ProgressStack = createNativeStackNavigator<ProgressStackParamList>();

function ProgressStackNavigator() {
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
    </ProgressStack.Navigator>
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


  const handleLogout = React.useCallback(async () => {
    console.log('[AppTabs] Logging out...');

    // NOTE: We do NOT clear user data on logout
    // - User-scoped storage already isolates data by user ID
    // - Incomplete sessions should persist between login sessions
    // - When user logs back in, their progress will be restored
    // - This allows user to logout with incomplete routine and resume later

    // Only clear the authentication state
    setUser(null);
    console.log('[AppTabs] User logged out (data preserved for next login)');
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
          height: TAB_BASE_HEIGHT + insets.bottom - 8,
          paddingTop: 10,
          paddingBottom: insets.bottom,
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
        name="Progreso"
        component={ProgressStackNavigator}
        options={{
          tabBarIcon: ({ focused, size = 20 }) =>
            renderTabPill(
              focused,
              <Ionicons
                name="stats-chart"
                size={size}
                color={focused ? '#635BFF' : (isDark ? '#9CA3AF' : '#6B7280')}
              />,
              'Progreso',
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
