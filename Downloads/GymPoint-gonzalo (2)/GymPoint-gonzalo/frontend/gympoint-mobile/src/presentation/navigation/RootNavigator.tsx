// src/presentation/navigation/RootNavigator.tsx

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View } from 'react-native';
import LoginScreen from '../../features/auth/ui/LoginScreen';
import GymsScreen  from '../../features/gyms/ui/GymsScreen';
import { useAuthStore } from '../../features/auth/state/auth.store';

// Importa los íconos que has añadido a tu carpeta assets
import homeIcon from '../../../assets/home.png';
import heartIcon from '../../../assets/heart.jpg';
import mapIcon from '../../../assets/map.jpg';
import settingsIcon from '../../../assets/settings.jpg';
import userIcon from '../../../assets/user.jpg';


const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false, // Oculta la cabecera por defecto
        tabBarActiveTintColor: '#635BFF', // Color del ícono activo (ej. violeta)
        tabBarInactiveTintColor: '#A8A8A8', // Color del ícono inactivo (ej. gris)
        tabBarStyle: {
          backgroundColor: '#635BFF', // Fondo de la barra de tabs
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="Inicio"
        component={GymsScreen} // Usa la misma pantalla de gimnasios, por ejemplo
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={homeIcon}
              style={{ tintColor: color, width: size, height: size }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Mi Gimnasio"
        component={() => <Text>Mi Gimnasio</Text>}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={heartIcon}
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
            <Image
              source={mapIcon}
              style={{ tintColor: color, width: size, height: size }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Ajustes"
        component={() => <Text>Ajustes</Text>}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={settingsIcon}
              style={{ tintColor: color, width: size, height: size }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Usuario"
        component={() => <Text>Usuario</Text>}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={userIcon}
              style={{ tintColor: color, width: size, height: size }}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

// ... El resto del RootNavigator se mantiene igual
export default function RootNavigator() {
  const user = useAuthStore(s => s.user);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
