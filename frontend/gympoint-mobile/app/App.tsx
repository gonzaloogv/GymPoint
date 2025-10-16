import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import '../global.css';
import { ThemeProvider } from '@shared/providers';
import { useTheme } from '@shared/hooks';

// 1. Importamos AMBAS pantallas para testear
import { LoginScreen } from '@features/auth';
import { RegisterScreen } from '@features/auth';

const qc = new QueryClient();

// 2. Definimos los tipos para nuestro stack de prueba
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// El componente App principal se mantiene simple, solo contiene los proveedores
export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Creamos un componente interno que renderiza el navegador de prueba
const AppContent = () => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login" // 3. Empezamos en la pantalla de Login
          screenOptions={{ headerShown: false }}
        >
          {/* 4. Añadimos ambas pantallas al stack */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

