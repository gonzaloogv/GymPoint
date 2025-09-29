import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Image } from 'react-native';

import { useTheme as useAppTheme } from 'styled-components/native';

import { useAuthStore } from '../../features/auth/state/auth.store';

import HomeScreen from '../../features/home/ui/HomeScreen';
import GymsScreen from '../../features/gyms/ui/GymsScreen';
import RewardsScreen from '../../features/rewards/ui/RewardsScreen';

// Ícono local
import WorkoutIcon from '../../../assets/icons/workout.svg';
import HomeIcon from '../../../assets/icons/home.svg';
import MapIcon from '../../../assets/icons/map.svg';
import UserIcon from '../../../assets/icons/user.svg';
import StoreIcon from '../../../assets/icons/gift.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabIcon } from './components/TabIcon';

const Tabs = createBottomTabNavigator();

// Placeholders locales
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
    const ITEM_MIN_WIDTH = 72; // ancho cómodo para icono + texto
    // bg-primary/10 → #RRGGBBAA (10% ≈ 0x1A)
    const primary10 = `${theme.colors.primary}1A`;

    // 2) Insets del dispositivo (iPhone con home indicator, Android con gesture bar, etc.)
    const insets = useSafeAreaInsets();
    const TAB_BASE_HEIGHT = 64; // altura cómoda para icono + texto

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
        paddingVertical: 4, // ~py-1
        paddingHorizontal: 12, // ~px-3
        borderRadius: theme.radius.md,
        backgroundColor: focused ? primary10 : 'transparent',
      }}
    >
      {children}
      <Text
      allowFontScaling={false}
      numberOfLines={1}         // ← no envuelve
      ellipsizeMode="clip"      // ← y no mete "..."
      style={{
        fontSize: 12,
        lineHeight: 14,         // evita recorte vertical
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
    [user, updateUser]
  );

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // seguimos dibujando el label manual
        tabBarStyle: {
          backgroundColor: theme.colors.card,   // bg-card
          borderTopColor: theme.colors.border,  // border-border
          elevation: 0,

          // 3) ← claves para que no se corte el texto
          height: TAB_BASE_HEIGHT + insets.bottom,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarIconStyle: { width: ITEM_MIN_WIDTH, alignItems: 'center', justifyContent: 'center' },
        // Opcional: un poquito de aire por item
        tabBarItemStyle: {
          paddingVertical: 2,
        },
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

      <Tabs.Screen
        name="Rutinas"
        component={MiGimnasioScreen}
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
