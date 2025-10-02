import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Button from '../../../shared/components/ui/Button';

export default function AdminScreen() {
  return (
    <ScrollView className="flex-1 bg-gp-bg px-6 pt-14">
      <Text className="text-2xl font-bold mb-4">Panel administrador</Text>
      <View className="bg-white rounded-2xl p-4 mb-3">
        <Text className="font-semibold mb-2">Solicitudes de alta</Text>
        <Button title="Aprobar" className="mb-2" />
        <Button title="Rechazar" variant="outline" />
      </View>
      <View className="bg-white rounded-2xl p-4">
        <Text className="font-semibold mb-2">Reportes</Text>
        <Text className="text-gp-muted">[Tabla/Lista]</Text>
      </View>
    </ScrollView>
  );
}
