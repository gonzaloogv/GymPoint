import React from 'react';
import { View, Text, FlatList } from 'react-native';
import Input from '../../../shared/components/ui/Input';

export default function HomeScreen() {
  const items = Array.from({ length: 6 }).map((_, i) => ({ id: i, name: `Gym #${i+1}` }));
  return (
    <View className="flex-1 bg-gp-bg">
      <View className="px-6 pt-14">
        <Text className="text-2xl font-bold text-gp-text mb-4">Descubrí gimnasios</Text>
        <Input placeholder="Buscar" />
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="mb-4 bg-white rounded-2xl p-4 shadow-sm">
            <View className="h-36 w-full bg-gray-200 rounded-xl mb-3" />
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-gp-muted">⭐ 4.5 • 1.2 km</Text>
          </View>
        )}
      />
    </View>
  );
}
