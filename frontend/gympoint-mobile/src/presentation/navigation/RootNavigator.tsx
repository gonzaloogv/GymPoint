import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, RegisterScreen, useAuthStore } from '@features/auth';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import AppTabs from './AppTabs';
import RewardsScreen from '@features/rewards/presentation/ui/screens/RewardsScreen';
import { TokenHistoryScreen } from '@features/progress/presentation/ui/screens/TokenHistoryScreen';
import { API_BASE_URL } from '@shared/config/env';

type RootStackParamList = {
  App: undefined;
  Login: undefined;
  Register: undefined;
  Rewards: undefined;
  TokenHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificar si hay sesión activa al montar
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        console.log('[RootNavigator] Checking for active session...');

        // IMPORTANTE: Usar las mismas claves que api.ts para consistencia
        const refreshToken = await SecureStore.getItemAsync('gp_refresh');
        const accessToken = await SecureStore.getItemAsync('gp_access');

        if (!refreshToken || !accessToken) {
          console.log('[RootNavigator] No active session found');
          setIsCheckingAuth(false);
          return;
        }

        console.log('[RootNavigator] Active session found, refreshing tokens...');

        // Intentar refrescar el token usando axios directo para evitar problemas de dependencias
        const tokenResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken
        });

        if (tokenResponse.data?.token) {
          // Token refrescado exitosamente, ahora obtener el perfil del usuario
          const userProfileResponse = await axios.get(`${API_BASE_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${tokenResponse.data.token}`
            }
          });

          const userProfile = userProfileResponse.data;

          if (userProfile) {
            console.log('[RootNavigator] Session restored:', userProfile.email);
            setUser({
              id_user: userProfile.id_user,
              name: userProfile.name,
              email: userProfile.email,
              role: userProfile.role,
              tokens: userProfile.tokens,
              plan: userProfile.plan,
            });
          } else {
            console.log('[RootNavigator] Failed to get user profile');
            await SecureStore.deleteItemAsync('gp_access');
            await SecureStore.deleteItemAsync('gp_refresh');
          }
        } else {
          console.log('[RootNavigator] Failed to refresh token');
          await SecureStore.deleteItemAsync('gp_access');
          await SecureStore.deleteItemAsync('gp_refresh');
        }
      } catch (error) {
        console.error('[RootNavigator] Session check failed:', error);
        // Si falla, limpiar tokens inválidos
        await SecureStore.deleteItemAsync('gp_access');
        await SecureStore.deleteItemAsync('gp_refresh');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkActiveSession();
  }, [setUser]);

  // Mostrar loading mientras verifica auth
  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator size="large" color="#635BFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "App" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        {user ? (
          <>
            <Stack.Screen name="App" component={AppTabs} />
            <Stack.Screen
              name="Rewards"
              options={{
                presentation: 'card',
                headerShown: false
              }}
            >
              {({ navigation }) => (
                <RewardsScreen
                  user={user}
                  onUpdateUser={updateUser}
                  navigation={navigation}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="TokenHistory"
              component={TokenHistoryScreen}
              options={{
                presentation: 'card',
                headerShown: false
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
