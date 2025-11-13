import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { isValidEmail, isValidPassword } from '@shared/utils/validation';
import {
  SurfaceScreen,
  Button,
  Card,
  Divider,
  FormField,
  Input,
  PasswordInput,
  ErrorText,
  H1,
  H2,
  Row,
} from '@shared/components/ui';
import { BrandMark } from '@shared/components/brand';
import { useAuthStore } from '../state/auth.store';
import { useTheme } from '@shared/hooks';
import { DI } from '@di/container';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  App: undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const setUser = useAuthStore((state) => state.setUser);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validar que los campos no estén vacíos
      if (!email.trim()) {
        setError('Por favor, ingresa tu email');
        return;
      }

      if (!password.trim()) {
        setError('Por favor, ingresa tu contraseña');
        return;
      }

      // Validar formato de email
      if (!isValidEmail(email)) {
        setError('Por favor, ingresa un email válido');
        return;
      }

      // Validar longitud de contraseña
      if (!isValidPassword(password)) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }

      // Intentar login con el backend
      const result = await DI.loginUser.execute({ email, password });
      Alert.alert('Bienvenido a GymPoint', 'Ahora podés navegar por la app.');
      setUser(result.user);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ??
        err?.message ??
        'Error al iniciar sesión. Revisa tus credenciales.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => console.log('Continuar con Google');
  const handleForgotPassword = () => console.log('Olvidé mi contraseña');
  const handleRegister = () => navigation.navigate('Register');

  const subtitleColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const helperColor = isDark ? 'text-gray-300' : 'text-gray-600';

  return (
    <SurfaceScreen
      scroll
      edges={['top', 'bottom']}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 32,
        paddingBottom: 140,
        alignItems: 'center',
      }}
      scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
    >
      <View className="items-center gap-3 mb-8 mt-12">
        <View className="w-20 h-20 rounded-full bg-white/10 dark:bg-white/5 items-center justify-center">
          <BrandMark size={64} />
        </View>
        <H1>GymPoint</H1>
        <Text className={`text-center px-8 ${subtitleColor}`}>Entrá y retomá tus entrenamientos.</Text>
      </View>

      <View className="w-full max-w-md">
          <Card
            variant="elevated"
            padding="lg"
          >
            <H2 align="center" className="mb-6">
              Iniciar sesión
            </H2>

            <View className="w-full gap-3">
              <FormField label="Email">
                <Input
                  placeholder="tu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </FormField>

              <FormField label="Contraseña">
                <PasswordInput
                  placeholder="Tu contraseña"
                  value={password}
                  onChangeText={setPassword}
                />
              </FormField>

              {error ? <ErrorText>{error}</ErrorText> : null}

              <Button onPress={handleLogin} disabled={loading} loading={loading} fullWidth className="mt-2">
                Iniciar sesión
              </Button>
              <Text className={`text-xs text-center ${helperColor}`}>
                Tus datos se cifran de extremo a extremo para mantener tu cuenta protegida.
              </Text>
            </View>

            <Divider text="o" className="my-6" />

            <Button onPress={handleGoogle} variant="secondary" fullWidth>
              Continuar con Google
            </Button>

            <View className="items-center mt-4">
              <TouchableOpacity onPress={handleForgotPassword} className="py-2">
                <Text className="font-medium text-primary">¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <Row justify="center" className="mt-3">
                <Text className={subtitleColor}>¿No tenés cuenta? </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text className="font-semibold text-primary">Crear cuenta</Text>
                </TouchableOpacity>
              </Row>
            </View>
          </Card>
        </View>
    </SurfaceScreen>
  );
}
