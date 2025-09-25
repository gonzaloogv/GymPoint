import React from 'react';
import { View, Text } from 'react-native';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';

export default function LoginScreen({ navigation }: any) {
  return (
    <View className="flex-1 bg-gp-bg px-6 pt-16">
      <Text className="text-3xl font-bold text-gp-text mb-8">Iniciar sesión</Text>
      <Input placeholder="Email" keyboardType="email-address" className="mb-4" />
      <Input placeholder="Contraseña" secureTextEntry className="mb-6" />
      <Button title="Entrar" onPress={() => navigation.replace('Main')} />
      <Text className="text-center text-gp-muted mt-4" onPress={() => navigation.push('Register')}>Crear cuenta</Text>
    </View>
  );
}
