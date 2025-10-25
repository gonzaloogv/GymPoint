import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, RegisterScreen, useAuthStore } from '@features/auth';
import AppTabs from './AppTabs';

type RootStackParamList = {
  App: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const user = useAuthStore((state) => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "App" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        {user ? (
          <Stack.Screen name="App" component={AppTabs} />
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