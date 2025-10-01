// src/presentation/navigation/AppTabs.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme as useAppTheme } from 'styled-components/native';

import WorkoutIcon from '@assets/icons/workout.svg';
import HomeIcon from '@assets/icons/home.svg';
import MapIcon from '@assets/icons/map.svg';
import StoreIcon from '@assets/icons/gift.svg';
import UserIcon from '@assets/icons/user.svg';
import { useAuthStore } from '@features/auth';
import { GymsScreen } from '@features/gyms';
import { HomeScreen } from '@features/home';
import { RewardsScreen } from '@features/rewards';
import {
  RoutineDetailScreen,
  RoutineExecutionScreen,
  RoutineHistoryScreen,
  RoutinesScreen,
} from '@features/routines';

import { TabIcon } from './components/TabIcon';

const Tabs = createBottomTabNavigator();

// ====== Routines nested stack ======
type RoutinesStackParamList = {
  RoutinesList: undefined;
  RoutineDetail: { id: string };
  RoutineHistory: { id: string };
  RoutineExecution: { id: string };
};
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

// Placeholders locales (pueden quedar por ahora)
function MiGimnasioScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Mi Gimnasio</Text>
    </View>
  );
}
function UsuarioScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Usuario</Text>
    </View>
  );
}

export default function AppTabs() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const ITEM_MIN_WIDTH = 72;
  const primary10 = `${theme.colors.primary}1A`;

  const insets = useSafeAreaInsets();
  const TAB_BASE_HEIGHT = 64;

  const Pill = ({
    focused,
    children,
    label,
  }: {
    focused: boolean;
    children: React.ReactNode;
    label: string;
  }) => (
    <View
      style={{
        width: '100%',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: theme.radius.md,
        backgroundColor: focused ? primary10 : 'transparent',
      }}
    >
      {children}
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        ellipsizeMode="clip"
        style={{
          fontSize: 12,
          lineHeight: 14,
          marginTop: 4,
          color: focused ? theme.colors.primary : theme.colors.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );

  const renderRewardsScreen = React.useCallback(
    () => <RewardsScreen user={user} onUpdateUser={updateUser} />,
    [user, updateUser],
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
          tabBarIcon: ({ focused, size = 20 }) => (
            <Pill focused={focused} label="Inicio">
              <TabIcon
                source={HomeIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />
            </Pill>
          ),
        }}
      />

      {/* Cambiamos el tab de Rutinas para usar el stack */}
      <Tabs.Screen
        name="Rutinas"
        component={RoutinesStackNavigator}
        options={{
          tabBarIcon: ({ focused, size = 20 }) => (
            <Pill focused={focused} label="Rutinas">
              <TabIcon
                source={WorkoutIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />
            </Pill>
          ),
        }}
      />

      <Tabs.Screen
        name="Mapa"
        component={GymsScreen}
        options={{
          tabBarIcon: ({ focused, size = 20 }) => (
            <Pill focused={focused} label="Mapa">
              <TabIcon
                source={MapIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />
            </Pill>
          ),
        }}
      />

      <Tabs.Screen
        name="Recompensa"
        children={renderRewardsScreen}
        options={{
          tabBarIcon: ({ focused, size = 20 }) => (
            <Pill focused={focused} label="Tienda">
              <TabIcon
                source={StoreIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />
            </Pill>
          ),
        }}
      />

      <Tabs.Screen
        name="Usuario"
        component={UsuarioScreen}
        options={{
          tabBarIcon: ({ focused, size = 20 }) => (
            <Pill focused={focused} label="Perfil">
              <TabIcon
                source={UserIcon}
                size={size}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />
            </Pill>
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
