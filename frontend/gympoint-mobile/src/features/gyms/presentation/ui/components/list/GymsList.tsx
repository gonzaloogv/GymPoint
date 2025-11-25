// src/features/gyms/ui/components/GymsList.tsx
import { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { LoadMoreButton } from '@shared/components/ui';
import { GymCard } from './GymCard';

type Item = {
  id: string | number;
  name: string;
  distancia?: number;
  address?: string;
};

type Props = {
  data: Item[];
  onPressItem?: (id: string | number) => void;
  initialItemsPerPage?: number;
};

const DEFAULT_ITEMS_PER_PAGE = 5;

export default function GymsList({ data, onPressItem, initialItemsPerPage = DEFAULT_ITEMS_PER_PAGE }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [visibleCount, setVisibleCount] = useState(initialItemsPerPage);

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

  // Calcular items visibles y restantes
  const visibleItems = data.slice(0, visibleCount);
  const remainingItems = data.length - visibleCount;
  const hasMore = remainingItems > 0;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + initialItemsPerPage, data.length));
  };

  // Renderizar lista con cards (gap de 16px entre cada card)
  return (
    <View className="gap-4">
      {visibleItems.map((item, index) => (
        <GymCard
          key={String(item.id)}
          id={item.id}
          name={item.name}
          distancia={item.distancia}
          address={item.address}
          index={index}
          onPress={onPressItem}
        />
      ))}

      {/* Botón "Ver más" si hay más items */}
      {hasMore && (
        <LoadMoreButton
          onPress={handleLoadMore}
          remainingItems={remainingItems}
        />
      )}
    </View>
  );
}
