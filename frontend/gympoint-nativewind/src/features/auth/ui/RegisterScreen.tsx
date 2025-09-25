import React from 'react';
import { View, Text } from 'react-native';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';

export default function RegisterScreen({ navigation }: any) {
  return (
    <View className="flex-1 bg-gp-bg px-6 pt-16">
      <Text className="text-3xl font-bold text-gp-text mb-8">Registrarse</Text>
      <Input placeholder="Nombre" className="mb-3" />
      <Input placeholder="Email" keyboardType="email-address" className="mb-3" />
      <Input placeholder="Contraseña" secureTextEntry className="mb-6" />
      <Button title="Crear cuenta" onPress={() => navigation.replace('Main')} />
    </View>
  );
}
