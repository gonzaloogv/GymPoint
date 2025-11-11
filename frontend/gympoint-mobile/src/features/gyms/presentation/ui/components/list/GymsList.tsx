// src/features/gyms/ui/components/GymsList.tsx
import { View, Text, FlatList } from 'react-native';
import { useTheme } from '@shared/hooks';
import { GymListItem } from './GymListItem';

type Item = {
  id: string | number;
  name: string;
  distancia?: number;
  address?: string;
  hours?: string;
};

type Props = {
  data: Item[];
  onPressItem?: (id: string | number) => void;
};

export default function GymsList({ data, onPressItem }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item, index }) => (
        <GymListItem
          id={item.id}
          name={item.name}
          distancia={item.distancia}
          address={item.address}
          hours={item.hours}
          index={index}
          onPress={onPressItem}
        />
      )}
      ItemSeparatorComponent={() => <View className="h-px bg-border" />}
      contentContainerStyle={{ paddingBottom: 24, backgroundColor: 'transparent' }}
    />
  );
}
