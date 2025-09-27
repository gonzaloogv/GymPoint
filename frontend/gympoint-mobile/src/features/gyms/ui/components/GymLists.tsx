// src/features/gyms/ui/components/GymsList.tsx
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { ListItem, IndexBadge } from '@shared/components/ui';

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
        headerText ? <Text style={{ color: '#6b7280', paddingHorizontal: 16, marginBottom: 8 }}>{headerText}</Text> : null
      }
      renderItem={({ item, index }) => (
        <ListItem
          onPress={() => onPressItem?.(item.id)}
          Left={<IndexBadge n={index + 1} />}
          Right={<Text style={{ color: '#9ca3af' }}>{'>'}</Text>}
        >
          <Text style={{ fontWeight: '600' }}>{item.name}</Text>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            {typeof item.distancia === 'number' ? `${(item.distancia / 1000).toFixed(1)} km` : '—'} • {item.hours ?? '—'}
          </Text>
          {!!item.address && <Text style={{ color: '#6b7280', fontSize: 12 }}>{item.address}</Text>}
        </ListItem>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
      contentContainerStyle={{ paddingBottom: 24, backgroundColor: 'transparent' }}
    />
  );
}
