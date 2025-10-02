import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Label } from '@shared/components/ui';
import { PROVINCES } from '@features/auth/domain/constants/provinces';

const SelectButton = styled(TouchableOpacity)`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.card};
  padding: 12px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
`;

const SelectText = styled(Text)<{ $placeholder?: boolean }>`
  color: ${({ theme, $placeholder }) => 
    $placeholder ? theme.colors.subtext : theme.colors.text};
  font-size: 16px;
`;

const ModalOverlay = styled(Modal)``;

const ModalContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled(View)`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  width: 90%;
  max-height: 70%;
  padding: 20px;
`;

const ModalTitle = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
`;

const OptionButton = styled(TouchableOpacity)`
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const OptionText = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
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

  const [modalVisible, setModalVisible] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCityChange = (value: string) => {
    handleChange('location', value);
    setModalVisible(false);
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
      <SelectButton onPress={() => setModalVisible(true)}>
        <SelectText $placeholder={!form.location}>
          {form.location || 'Selecciona tu localidad'}
        </SelectText>
        <Ionicons name="chevron-down" size={20} />
      </SelectButton>

      <ModalOverlay
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <ModalContainer>
          <ModalContent>
            <ModalTitle>Selecciona tu localidad</ModalTitle>
            <ScrollView>
              {PROVINCES.map((province) => (
                <OptionButton
                  key={province.value}
                  onPress={() => handleCityChange(province.label)}
                >
                  <OptionText>{province.label}</OptionText>
                </OptionButton>
              ))}
            </ScrollView>
            <Button onPress={() => setModalVisible(false)} style={{ marginTop: 12 }}>
              Cancelar
            </Button>
          </ModalContent>
        </ModalContainer>
      </ModalOverlay>

      <Label>Edad</Label>
      <Input value={form.age} keyboardType='number-pad' inputMode="numeric"  onChangeText={(t) => handleChange('age', t.replace(/\D/g, ''))} maxLength={3}/>

      <Label>Género</Label>
      

      <Button disabled={loading} onPress={handleSubmit}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </View>
  );
}