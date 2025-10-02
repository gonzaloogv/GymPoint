import { useState } from 'react';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styled from 'styled-components/native';
import { Button, ButtonText, Input, Label } from '@shared/components/ui';
import { PROVINCES } from '@features/auth/domain/constants/provinces';

const PickerWrapper = styled(View)`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.card};
  overflow: hidden;
`;

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

  const handleCityChange = (value: string) => {
    handleChange('location', value);
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
      <PickerWrapper>
        <Picker
          selectedValue={form.location}
          onValueChange={handleCityChange}
          style={{ height: 50 }}
        >
          <Picker.Item label="Selecciona tu localidad" value="" />
          {PROVINCES.map((province) => (
            <Picker.Item
              key={province.value}
              label={province.label}
              value={province.label}
            />
          ))}
        </Picker>
      </PickerWrapper>

      <Label>Edad</Label>
      <Input value={form.age} keyboardType='number-pad' inputMode="numeric"  onChangeText={(t) => handleChange('age', t.replace(/\D/g, ''))} maxLength={3}/>

      <Label>Género</Label>
      

      <Button disabled={loading} onPress={handleSubmit}>
        <ButtonText>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </ButtonText>
      </Button>
    </View>
  );
}