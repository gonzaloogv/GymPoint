import { useState } from 'react';
import { View } from 'react-native';
import { Button, ButtonText, Input, Label } from '@shared/components/ui';
import { LocationSelector } from './LocationSelector';
import { GenderRadioGroup } from './GenderRadioGroup';
import { FrequencySlider } from './FrequencySlider';
import { BirthDatePicker } from './BirthDatePicker';

interface Props {
  loading: boolean;
  onSubmit: (data: {
    fullName: string;
    email: string;
    password: string;
    location: string;
    birthDate: string;
    gender: string;
    weeklyFrequency: number;
  }) => void;
}

export function RegisterForm({ loading, onSubmit }: Props) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    birthDate: '',
    gender: '',
    weeklyFrequency: 3,
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) return;

    onSubmit({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      location: form.location,
      birthDate: form.birthDate,
      gender: form.gender,
      weeklyFrequency: form.weeklyFrequency,
    });
  };

  return (
    <View style={{ gap: 12 }}>
      <Label>Nombre completo</Label>
      <Input
        value={form.fullName}
        onChangeText={(t) => handleChange('fullName', t)}
        maxLength={50}
      />

      <Label>Email</Label>
      <Input value={form.email} onChangeText={(t) => handleChange('email', t)} />

      <Label>Contraseña</Label>
      <Input
        secureTextEntry
        value={form.password}
        onChangeText={(t) => handleChange('password', t)}
      />

      <Label>Confirmar contraseña</Label>
      <Input
        secureTextEntry
        value={form.confirmPassword}
        onChangeText={(t) => handleChange('confirmPassword', t)}
      />

      <Label>Localidad</Label>
      <LocationSelector
        value={form.location}
        onChange={(value) => handleChange('location', value)}
      />

      <Label>Fecha de nacimiento</Label>
      <BirthDatePicker
        value={form.birthDate}
        onChange={(value) => handleChange('birthDate', value)}
      />

      <Label>Género</Label>
      <GenderRadioGroup
        value={form.gender}
        onChange={(value) => handleChange('gender', value)}
      />

      <Label>Frecuencia semanal de entrenamiento</Label>
      <FrequencySlider
        value={form.weeklyFrequency}
        onChange={(value) => handleChange('weeklyFrequency', value)}
      />

      <Button disabled={loading} onPress={handleSubmit}>
        <ButtonText>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</ButtonText>
      </Button>
    </View>
  );
}
