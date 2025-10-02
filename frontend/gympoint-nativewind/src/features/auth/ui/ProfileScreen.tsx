import React from 'react';
import { View, Text } from 'react-native';
import Button from '../../../shared/components/ui/Button';
export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-gp-bg px-6 pt-16">
      <View className="items-center mb-6">
        <View className="w-24 h-24 rounded-full bg-gray-300 mb-3" />
        <Text className="text-xl font-semibold">Gonza</Text>
        <Text className="text-gp-muted">Usuario Premium</Text>
      </View>
      <Button title="Mi racha" className="mb-3" />
      <Button title="Editar perfil" variant="outline" />
    </View>
  );
}
