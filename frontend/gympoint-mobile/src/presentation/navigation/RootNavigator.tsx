import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../../features/auth/ui/LoginScreen';
import GymsScreen from '../../features/gyms/ui/GymsScreen';
import { useAuthStore } from '../../features/auth/state/auth.store';
import { Text } from 'react-native';


const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();


function AppTabs() {
return (
<Tabs.Navigator>
<Tabs.Screen name="Gyms" component={GymsScreen} />
<Tabs.Screen name="Profile" component={() => <Text>Profile</Text>} />
</Tabs.Navigator>
);
}


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