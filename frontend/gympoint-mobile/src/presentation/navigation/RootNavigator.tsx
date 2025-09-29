// src/presentation/navigation/RootNavigator.tsx

import React from 'react';
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View } from 'react-native';
import { useTheme as useAppTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../features/auth/state/auth.store';

import LoginScreen from '../../features/auth/ui/LoginScreen';
import HomeScreen from '../../features/home/ui/HomeScreen';
import GymsScreen from '../../features/gyms/ui/GymsScreen';
import RewardsScreen from '../../features/rewards/ui/RewardsScreen';

// Íconos locales
import homeIcon from '../../../assets/home.png';
import gymIcon from '../../../assets/dumbbell_538914.png';
import mapIcon from '../../../assets/map.png';
import settingsIcon from '../../../assets/settings.png';
import userIcon from '../../../assets/user.png';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// Placeholders
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

    function AppTabs() {
  // Asegúrate de extraer las funciones del store aquí
  const user = useAuthStore((s) => s.user); 
  const updateUser = useAuthStore((s) => s.updateUser);

  const renderRewardsScreen = React.useCallback(
    // Pasamos la función con el nombre correcto a la prop 'onUpdateUser' de RewardsScreen
    () => <RewardsScreen user={user} onUpdateUser={updateUser} />,
    [user, updateUser] // Dependencias actualizadas
  );

  return (
    <Tabs.Navigator
      // sceneContainerStyle  ❌  (tu versión no lo tipa)
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#A8A8A8',
        tabBarStyle: {
          backgroundColor: '#635BFF',
          borderTopWidth: 0,
          elevation: 0,
        },
        // Para iOS: evita translucencias en la TabBar
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: '#635BFF' }} />
        ),
      }}
    >
      <Tabs.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons 
              name='home-outline' 
              color={color} 
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Rutinas"
        component={MiGimnasioScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={gymIcon}
              style={{ tintColor: color, width: size, height: size }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Mapa"
        component={GymsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name='navigate-outline'
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Recompensa"
        children={renderRewardsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons 
              name='gift-outline'
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Usuario"
        component={UsuarioScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name='person-outline'
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const theme = useAppTheme();
  const user = useAuthStore((s) => s.user);

  // Fondo unificado para evitar la franja gris
  const navTheme = React.useMemo(
    () => ({
      ...NavDefaultTheme,
      colors: {
        ...NavDefaultTheme.colors,
        background: theme?.colors?.bg ?? '#fff',
        card: theme?.colors?.bg ?? '#fff',
        border: 'transparent',
      },
    }),
    [theme],
  );

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // fondo de cada escena del stack
          contentStyle: { backgroundColor: theme?.colors?.bg ?? '#fff' },
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