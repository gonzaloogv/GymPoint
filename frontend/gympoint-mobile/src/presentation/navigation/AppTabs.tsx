import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Image } from 'react-native';
import { useTheme as useAppTheme } from 'styled-components/native';

import { useAuthStore } from '../../features/auth/state/auth.store';

import HomeScreen from '../../features/home/ui/HomeScreen';
import GymsScreen from '../../features/gyms/ui/GymsScreen';
import RewardsScreen from '../../features/rewards/ui/RewardsScreen';

// Ícono local
import gymIcon from '../../../assets/dumbbell_538914.png';
import homeIcon from '../../../assets/home.png';
import mapIcon from '../../../assets/map.png';
import userIcon from '../../../assets/user.png';
import giftIcon from '../../../assets/gift_548427.png';

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

  // bg-primary/10 → #RRGGBBAA (10% ≈ 0x1A)
  const primary10 = `${theme.colors.primary}1A`;

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
        alignItems: 'center',
        paddingVertical: 4, // ~py-1
        paddingHorizontal: 12, // ~px-3
        borderRadius: theme.radius.md,
        backgroundColor: focused ? primary10 : 'transparent',
      }}
    >
      {children}
      <Text
        style={{
          fontSize: 12, // text-xs
          marginTop: 4, // mt-1
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
        tabBarShowLabel: false, // ocultamos label por defecto, lo dibujamos manual
        tabBarStyle: {
          backgroundColor: theme.colors.card,   // bg-card
          borderTopColor: theme.colors.border,  // border-border
          borderTopWidth: 1,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, size = 20 }) => (
            <Pill focused={focused} label="Inicio">
              <Image
                source={homeIcon}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? theme.colors.primary : theme.colors.textMuted,
                  resizeMode: 'contain',
                }}
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
              <Image
                source={gymIcon}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? theme.colors.primary : theme.colors.textMuted,
                  resizeMode: 'contain',
                }}
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
              <Image
                source={mapIcon}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? theme.colors.primary : theme.colors.textMuted,
                  resizeMode: 'contain',
                }}
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
            <Pill focused={focused} label="Recompensas">
              <Image
                source={giftIcon}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? theme.colors.primary : theme.colors.textMuted,
                  resizeMode: 'contain',
                }}
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
              <Image
                source={userIcon}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? theme.colors.primary : theme.colors.textMuted,
                  resizeMode: 'contain',
                }}
              />
            </Pill>
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
