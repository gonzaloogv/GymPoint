// src/features/gyms/ui/components/GymsList.tsx
import { View, Text, FlatList } from 'react-native';
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
  headerText?: string;
  onPressItem?: (id: string | number) => void;
};

export default function GymsList({ data, headerText, onPressItem }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        headerText ? (
          <Text style={{ color: '#6b7280', paddingHorizontal: 16, marginBottom: 8 }}>
            {headerText}
          </Text>
        ) : null
      }
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
      ItemSeparatorComponent={() => (
        <View style={{ height: 1, backgroundColor: '#eee' }} />
      )}
      contentContainerStyle={{ paddingBottom: 24, backgroundColor: 'transparent' }}
    />
  );
}
