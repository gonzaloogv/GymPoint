import { useState } from 'react';
import { View } from 'react-native';
import { Button, Input, Label, Select, RadioGroup, Slider } from '@shared/components/ui';
import { PROVINCES } from '@features/auth/domain/constants/provinces';

interface Props {
  loading: boolean;
  onSubmit: (data: {
    fullName: string;
    email: string;
    password: string;
    location: string;
    age: number;
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
    age: '',
    gender: '',
    weeklyFrequency: [3],
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const [selectedCity, setSelectedCity] = useState<string>('');

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    console.log('Localidad seleccionada:', value);
  };

  const handleSubmit = () => {
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) return;

    onSubmit({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      location: form.location,
      age: parseInt(form.age),
      gender: form.gender,
      weeklyFrequency: form.weeklyFrequency[0],
    });
  };

  return (
    <View style={{ gap: 12 }}>
      <Label>Nombre completo</Label>
      <Input value={form.fullName} onChangeText={(t) => handleChange('fullName', t)} maxLength={50}/>

      <Label>Email</Label>
      <Input value={form.email} onChangeText={(t) => handleChange('email', t)} />

      <Label>Contraseña</Label>
      <Input secureTextEntry value={form.password} onChangeText={(t) => handleChange('password', t)} />

      <Label>Confirmar contraseña</Label>
      <Input secureTextEntry value={form.confirmPassword} onChangeText={(t) => handleChange('confirmPassword', t)} />

      <Label>Localidad</Label>
      <Select value={selectedCity} options={PROVINCES} placeholder='Selecciona tu localidad' onChange={handleCityChange}></Select>

      <Label>Edad</Label>
      <Input value={form.age} keyboardType='number-pad' inputMode="numeric"  onChangeText={(t) => handleChange('age', t.replace(/\D/g, ''))} maxLength={3}/>

      <Label>Género</Label>
      

      <Button disabled={loading} onPress={handleSubmit}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </View>
  );
}