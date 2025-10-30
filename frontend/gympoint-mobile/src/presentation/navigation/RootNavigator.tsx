import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, RegisterScreen, useAuthStore } from '@features/auth';
import AppTabs from './AppTabs';
import RewardsScreen from '@features/rewards/presentation/ui/screens/RewardsScreen';
import { TokenHistoryScreen } from '@features/progress/presentation/ui/screens/TokenHistoryScreen';

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
  const updateUser = useAuthStore((state) => state.updateUser);

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
              {() => <RewardsScreen user={user} onUpdateUser={updateUser} />}
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