// src/features/gyms/ui/components/GymsList.tsx
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { GymListItem } from './GymListItem';

type Item = {
  id: string | number;
  name: string;
  distancia?: number;
  address?: string;
};

type Props = {
  data: Item[];
  onPressItem?: (id: string | number) => void;
};

export default function GymsList({ data, onPressItem }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Si no hay datos, mostrar el estado vacío
  if (data.length === 0) {
    return (
      <View className="items-center justify-center py-20 px-8">
        <Ionicons
          name="business-outline"
          size={64}
          color={isDark ? '#4B5563' : '#D1D5DB'}
        />
        <Text className={`text-lg font-semibold mt-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          No hay gimnasios disponibles
        </Text>
        <Text className={`text-sm mt-2 text-center leading-5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          Aún no se han cargado gimnasios en la aplicación.{'\n'}
          Vuelve más tarde para encontrar espacios cercanos.
        </Text>
      </View>
    );
  }

  // Renderizar lista de tarjetas de gimnasios
  // Cambios (FASE 2 - Redesign):
  // - Removido: separadores entre items (ahora cada card tiene su propio espaciado)
  // - Removido: prop index (LocationBadge no lo necesita)
  // - Padding: las cards manejan su propio spacing (marginBottom en GymListItem)
  return (
    <View className="pb-6">
      {data.map((item) => (
        <GymListItem
          key={String(item.id)}
          id={item.id}
          name={item.name}
          distancia={item.distancia}
          address={item.address}
          onPress={onPressItem}
        />
      ))}
    </View>
  );
}
