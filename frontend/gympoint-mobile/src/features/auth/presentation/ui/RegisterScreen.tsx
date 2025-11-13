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
import { BrandMark } from '@shared/components/brand';
import { GymPointLogo } from '@assets/branding/gympoint-logo.svg';
import { useRegister } from '../hooks/useRegister';
import { isValidEmail, isValidName, isValidPassword, passwordsMatch } from '@shared/utils/validation';
import { GenderRadioGroup } from './components/GenderRadioGroup';
import { LocationSelector } from './components/LocationSelector';
import { FrequencySlider } from './components/FrequencySlider';
import { BirthDatePicker } from './components/BirthDatePicker';
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

  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [weeklyFrequency, setWeeklyFrequency] = useState(3);

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
    if (!birthDate) {
      Alert.alert('Error', 'Seleccioná tu fecha de nacimiento');
      return;
    }
    if (!gender) {
      Alert.alert('Error', 'Seleccioná tu género');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Seleccioná tu provincia');
      return;
    }

    const formattedBirthDate = birthDate.toISOString().split('T')[0];

    const result = await register({
      fullName: `${name} ${lastname}`,
      email,
      password,
      location,
      birth_date: formattedBirthDate,
      gender,
      weeklyFrequency,
    });

    if (result.success) {
      Alert.alert('Registro completo', 'Ya podés iniciar sesión.', [
        { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') },
      ]);
    }
  };

  const handleGoogle = () => console.log('Continuar con Google');
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
        <View className="w-20 h-20 rounded-full bg-white/10 dark:bg-white/5 items-center justify-center">
          <BrandMark icon={GymPointLogo} size="lg" />
        </View>
        <H1>GymPoint</H1>
        <Text className={`text-center px-8 ${subtitleColor}`}>
          Unite y empezá a seguir tus entrenamientos desde un mismo lugar.
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

              <FormField label="Provincia">
                <LocationSelector value={location} onChange={setLocation} />
              </FormField>

              <FormField label="Fecha de nacimiento">
                <BirthDatePicker value={birthDate} onChange={setBirthDate} />
              </FormField>

              <FormField label="Género">
                <GenderRadioGroup value={gender} onChange={setGender} />
              </FormField>

              <FormField label={`Frecuencia semanal: ${weeklyFrequency} ${weeklyFrequency === 1 ? 'día' : 'días'}`}>
                <FrequencySlider value={weeklyFrequency} onChange={setWeeklyFrequency} />
              </FormField>

              {error ? (
                <View className="mb-4 items-center">
                  <ErrorText>{error}</ErrorText>
                </View>
              ) : null}

              <Button onPress={handleRegister} disabled={loading} loading={loading} fullWidth className="mt-2">
                Crear cuenta
              </Button>
            </View>

            <Divider text="o" className="my-6" />

            <Button onPress={handleGoogle} variant="secondary" fullWidth>
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
