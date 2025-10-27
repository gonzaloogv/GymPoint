import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import dumbbellIcon from '@assets/dumbbell.png';
import {
  Button,
  Card,
  Divider,
  FormField,
  Input,
  Screen,
  H1,
  H2,
  Row,
} from '@shared/components/ui';
import { BrandMark } from '@shared/components/brand';
import { useRegister } from '../hooks/useRegister';

import { GenderRadioGroup } from './components/GenderRadioGroup';
import { LocationSelector } from './components/LocationSelector';
import { FrequencySlider } from './components/FrequencySlider';
import { useTheme } from '@shared/hooks';

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

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weeklyFrequency, setWeeklyFrequency] = useState(3);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const result = await register({
      fullName,
      email,
      password,
      location,
      birth_date: age, // age field is used for birth date in registration form
      gender,
      weeklyFrequency,
    });

    if (result.success) {
      navigation.navigate('App');
    } else {
      Alert.alert(
        'Error de registro',
        result.error || 'No se pudo completar el registro'
      );
    }
  };

  const handleGoogle = () => console.log('Continuar con Google');
  const handleBackToLogin = () => navigation.navigate('Login');

  const subtitleColor = isDark ? 'text-textSecondary-dark' : 'text-textSecondary';

  return (
    <Screen
      scroll
      safeAreaTop={true}
      safeAreaBottom={true}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center items-center py-6">
        {/* Header */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-primary rounded-full items-center justify-center mb-3">
            <Text className="text-3xl">🏋️</Text>
          </View>
          <H1 className="text-2xl">GymPoint</H1>
          <Text className={`mt-1 text-center ${subtitleColor}`}>
            Unite a la comunidad fitness
          </Text>
        </View>

        <Card variant="elevated" padding="lg" className="w-full max-w-md">
          <H2 align="center" className="mb-6">
            Crear cuenta
          </H2>

          <View className="w-full">
            <FormField label="Nombre completo">
              <Input
                placeholder="Juan Pérez"
                value={fullName}
                onChangeText={setFullName}
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

            <FormField label="Contraseña">
              <Input
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </FormField>

            <FormField label="Confirmar contraseña">
              <Input
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </FormField>

            <FormField label="Provincia">
              <LocationSelector value={location} onChange={setLocation} />
            </FormField>

            <FormField label="Edad">
              <Input
                placeholder="Ej: 25"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={2}
              />
            </FormField>

            <FormField label="Género">
              <GenderRadioGroup value={gender} onChange={setGender} />
            </FormField>

            <FormField
              label={`Frecuencia semanal: ${weeklyFrequency} ${
                weeklyFrequency === 1 ? 'día' : 'días'
              }`}
            >
              <FrequencySlider
                value={weeklyFrequency}
                onChange={setWeeklyFrequency}
              />
            </FormField>

            {error && (
              <Text className="text-sm text-error mt-2 text-center">
                {error}
              </Text>
            )}

            <Button
              onPress={handleRegister}
              disabled={loading}
              loading={loading}
              fullWidth
              className="mt-4"
            >
              Crear cuenta
            </Button>
          </View>

          <Divider text="o" />

          <Button onPress={handleGoogle} variant="secondary" fullWidth>
            Continuar con Google
          </Button>

          <View className="items-center mt-4">
            <Row justify="center">
              <Text className={subtitleColor}>¿Ya tenés cuenta? </Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text className="font-semibold text-primary">
                  Iniciar sesión
                </Text>
              </TouchableOpacity>
            </Row>
          </View>
        </Card>
      </View>
    </Screen>
  );
}