// Importamos las pantallas de Login y Registro
import { LoginScreen } from '@features/auth';
import { RegisterScreen } from '@features/auth';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Definimos los tipos para las rutas del stack de autenticación
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Este navegador se encargará del flujo de autenticación para las pruebas
export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      {/* Añadimos ambas pantallas al stack */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}