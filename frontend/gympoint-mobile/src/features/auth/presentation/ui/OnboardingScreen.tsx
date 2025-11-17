import { useState } from 'react';
import { View, Text, Alert } from 'react-native';

import {
  SurfaceScreen,
  Button,
  Card,
  FormField,
  ErrorText,
  H1,
  H2,
} from '@shared/components/ui';
import { AppLogo } from '@shared/components/brand';
import { useOnboarding } from '../hooks/useOnboarding';
import { GenderRadioGroup } from './components/GenderRadioGroup';
import { FrequencySlider } from './components/FrequencySlider';
import { BirthDatePicker } from './components/BirthDatePicker';
import { useTheme } from '@shared/hooks';

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { completeOnboarding, loading, error } = useOnboarding();

  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [weeklyFrequency, setWeeklyFrequency] = useState(3);

  const subtitleColor = isDark ? 'text-gray-400' : 'text-gray-500';

  const handleCompleteOnboarding = async () => {
    if (!birthDate) {
      Alert.alert('Error', 'Seleccioná tu fecha de nacimiento');
      return;
    }
    if (!gender) {
      Alert.alert('Error', 'Seleccioná tu género');
      return;
    }

    // Validar edad (13-100 años)
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (actualAge < 13) {
      Alert.alert('Error', 'Debes tener al menos 13 años para usar la aplicación');
      return;
    }
    if (actualAge > 100) {
      Alert.alert('Error', 'La fecha de nacimiento no parece válida');
      return;
    }

    const formattedBirthDate = birthDate.toISOString().split('T')[0];

    const result = await completeOnboarding({
      frequencyGoal: weeklyFrequency,
      birthDate: formattedBirthDate,
      gender: gender as 'M' | 'F' | 'O',
    });

    if (result.success) {
      // El updateUser ya actualiza el store, la navegación se manejará automáticamente
      console.log('✅ Perfil completado, navegando a la app...');
    }
  };

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
        <H1>Completá tu perfil</H1>
        <Text className={`text-center px-8 ${subtitleColor}`}>
          Necesitamos algunos datos más para personalizar tu experiencia.
        </Text>
      </View>

      <View className="w-full max-w-2xl">
        <Card variant="elevated" padding="lg">
          <H2 align="center" className="mb-6">
            Información personal
          </H2>

          <View className="w-full gap-4">
            <FormField label="Fecha de nacimiento">
              <BirthDatePicker value={birthDate} onChange={setBirthDate} />
            </FormField>

            <FormField label="Género">
              <GenderRadioGroup value={gender} onChange={setGender} />
            </FormField>

            <FormField
              label={`Frecuencia semanal objetivo: ${weeklyFrequency} ${weeklyFrequency === 1 ? 'día' : 'días'}`}
            >
              <FrequencySlider value={weeklyFrequency} onChange={setWeeklyFrequency} />
            </FormField>

            <Text className={`text-sm ${subtitleColor} text-center mt-2`}>
              Establecé cuántos días por semana querés entrenar. Podrás cambiarlo después.
            </Text>

            {error ? <ErrorText>{error}</ErrorText> : null}

            <Button
              onPress={handleCompleteOnboarding}
              disabled={loading}
              loading={loading}
              fullWidth
              className="mt-4"
            >
              Completar perfil
            </Button>
          </View>
        </Card>
      </View>
    </SurfaceScreen>
  );
}
