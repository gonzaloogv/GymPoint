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

  const handleRegister = async () => {
    // Validación de nombre
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return;
    }

    // Validación de apellido
    if (!lastname.trim() || lastname.trim().length < 2) {
      Alert.alert('Error', 'El apellido debe tener al menos 2 caracteres');
      return;
    }

    // Validación de email
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Por favor, ingresá un email válido');
      return;
    }

    // Validación de contraseña
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password.length > 64) {
      Alert.alert('Error', 'La contraseña no puede tener más de 64 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Validación de fecha de nacimiento
    if (!birthDate) {
      Alert.alert('Error', 'Por favor, seleccioná tu fecha de nacimiento');
      return;
    }

    // Validación de género
    if (!gender) {
      Alert.alert('Error', 'Por favor, seleccioná tu género');
      return;
    }

    // Validación de localidad
    if (!location.trim()) {
      Alert.alert('Error', 'Por favor, seleccioná tu provincia');
      return;
    }

    // Formatear fecha a YYYY-MM-DD para el backend
    const formattedBirthDate = birthDate.toISOString().split('T')[0];

    console.log('🚀 Iniciando registro con datos:', {
      name,
      lastname,
      email,
      gender,
      location,
      birth_date: formattedBirthDate,
      weeklyFrequency,
    });

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
      console.log('✅ Registro exitoso, navegando a Login...');
      Alert.alert(
        'Cuenta creada',
        'Tu cuenta ha sido creada exitosamente. Ahora podés iniciar sesión.',
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } else {
      console.error('❌ Error en registro:', result.error);
      Alert.alert(
        'Error de registro',
        result.error || 'No se pudo completar el registro. Verificá tus datos e intentá nuevamente.',
        [{ text: 'Aceptar' }]
      );
    }
  };

  const handleGoogle = () => console.log('Continuar con Google');
  const handleBackToLogin = () => navigation.navigate('Login');

  const subtitleColor = isDark ? 'text-textSecondary-dark' : 'text-textSecondary';

  return (
    <Screen
      scroll
      padBottom="safe"
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
              <Input
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                maxLength={64}
              />
            </FormField>

            <FormField label="Confirmar contraseña">
              <Input
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
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
