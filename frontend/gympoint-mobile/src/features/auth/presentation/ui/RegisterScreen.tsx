import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
import { AppLogo } from '@shared/components/brand';
import { GoogleIcon } from '@shared/components/icons';
import { useRegister } from '../hooks/useRegister';
import { isValidEmail, isValidName, isValidPassword, passwordsMatch } from '@shared/utils/validation';
import { GenderRadioGroup } from './components/GenderRadioGroup';
import { LocationSelector } from './components/LocationSelector';
import { FrequencySlider } from './components/FrequencySlider';
import { BirthDatePicker } from './components/BirthDatePicker';
import { useTheme } from '@shared/hooks';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useAuthStore } from '../state/auth.store';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  App: undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { register, loading, error } = useRegister();
  const { startGoogleAuth, googleError, googleLoading } = useGoogleAuth();
  const setUser = useAuthStore((state) => state.setUser);

  // Onboarding 2 fases: solo campos básicos en Fase 1
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const subtitleColor = isDark ? 'text-gray-400' : 'text-gray-500';

  const handleRegister = async () => {
    if (!isValidName(name)) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (!isValidName(lastname)) {
      Alert.alert('Error', 'El apellido debe tener al menos 2 caracteres');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Ingresá un email válido');
      return;
    }
    if (!isValidPassword(password)) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password.length > 64) {
      Alert.alert('Error', 'La contraseña no puede superar los 64 caracteres');
      return;
    }
    if (!passwordsMatch(password, confirmPassword)) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Onboarding 2 fases: solo enviar campos básicos
    const result = await register({
      fullName: `${name} ${lastname}`,
      email,
      password,
    });

    if (result.success && result.user) {
      // Actualizar store de Zustand para que RootNavigator detecte needsOnboarding
      setUser(result.user);
      Alert.alert('Registro exitoso', 'Completá tu perfil para continuar.');
      // RootNavigator detectará profileCompleted: false y navegará a Onboarding automáticamente
    }
  };

  const handleBackToLogin = () => navigation.navigate('Login');

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
      <View className="items-center gap-3 mb-8 mt-8">
        <AppLogo size={100} />
        <H1>GymPoint</H1>
        <Text className={`text-center px-8 ${subtitleColor}`}>
          Creá tu cuenta y empezá a seguir tus entrenamientos.
        </Text>
      </View>

      <View className="w-full max-w-2xl">
          <Card
            variant="elevated"
            padding="lg"
          >
            <H2 align="center" className="mb-6">
              Crear cuenta
            </H2>

            <View className="w-full gap-3">
              <FormField label="Nombre">
                <Input
                  placeholder="Juan"
                  value={name}
                  onChangeText={setName}
                  maxLength={80}
                />
              </FormField>

              <FormField label="Apellido">
                <Input
                  placeholder="Pérez"
                  value={lastname}
                  onChangeText={setLastname}
                  maxLength={80}
                />
              </FormField>

              <FormField label="Email">
                <Input
                  placeholder="tu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </FormField>

              <FormField label="Contraseña" hint="Mínimo 8 caracteres">
                <PasswordInput
                  placeholder="********"
                  value={password}
                  onChangeText={setPassword}
                  maxLength={64}
                />
              </FormField>

              <FormField label="Confirmar contraseña">
                <PasswordInput
                  placeholder="********"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  maxLength={64}
                />
              </FormField>

              {/* Onboarding 2 fases: campos de perfil se completan en OnboardingScreen */}

              {error || googleError ? (
                <ErrorText className="text-center">{error ?? googleError}</ErrorText>
              ) : null}

              <Button onPress={handleRegister} disabled={loading} loading={loading} fullWidth className="mt-2">
                Crear cuenta
              </Button>
            </View>

            <Divider text="o" className="my-6" />

            <Button
              onPress={startGoogleAuth}
              variant="secondary"
              fullWidth
              disabled={googleLoading}
              loading={googleLoading}
              icon={<GoogleIcon size={20} />}
            >
              Continuar con Google
            </Button>

            <View className="items-center mt-4">
              <Row justify="center">
                <Text className={subtitleColor}>¿Ya tenés cuenta? </Text>
                <TouchableOpacity onPress={handleBackToLogin}>
                  <Text className="font-semibold text-primary">Iniciar sesión</Text>
                </TouchableOpacity>
              </Row>
            </View>
          </Card>
        </View>
    </SurfaceScreen>
  );
}
