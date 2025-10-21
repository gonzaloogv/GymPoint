import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import dumbbellIcon from '@assets/dumbbell.png';
import {
  Button,
  Card,
  Divider,
  FormField,
  Input,
  PasswordInput,
  ErrorText,
  Screen,
  H1,
  H2,
  Row,
} from '@shared/components/ui';
import { BrandMark } from '@shared/components/brand';
import { useAuthStore } from '../state/auth.store';
import { useTheme } from '@shared/hooks';

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
      setUser({
        id_user: -1,
        name: 'Usuario Demo',
        email: email || 'demo@gympoint.app',
        role: 'USER',
        tokens: 0,
        plan: 'Free',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => console.log('Continuar con Google');
  const handleForgotPassword = () => console.log('Olvidé mi contraseña');
  const handleRegister = () => navigation.navigate('Register');

  const subtitleColor = isDark ? 'text-textSecondary-dark' : 'text-textSecondary';

  return (
    <Screen
      scroll
      padBottom="safe"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center items-center px-4 py-6">
        <View className="items-center mb-8">
          {/* Icono temporal en lugar de BrandMark */}
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">🏋️</Text>
          </View>
          <H1 className="mt-2">GymPoint</H1>
          <Text className={`mt-2 text-center ${subtitleColor}`}>
            Encontrá tu gym ideal y mantené tu racha
          </Text>
        </View>

        <Card variant="elevated" padding="lg" className="w-full max-w-md">
          <H2 align="center" className="mb-6">
            Iniciar sesión
          </H2>

          <View className="w-full">
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

            {error && <ErrorText>{error}</ErrorText>}

            <Button
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
              fullWidth
              className="mt-4"
            >
              Iniciar sesión
            </Button>
          </View>

          <Divider text="o" />

          <Button onPress={handleGoogle} variant="secondary" fullWidth>
            Continuar con Google
          </Button>

          <View className="items-center mt-4">
            <TouchableOpacity onPress={handleForgotPassword} className="py-2">
              <Text className="font-medium text-primary">
                ¿Olvidaste tu contraseña?
              </Text>
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
    </Screen>
  );
}