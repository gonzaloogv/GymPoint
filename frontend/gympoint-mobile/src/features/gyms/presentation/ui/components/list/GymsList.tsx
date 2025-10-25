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
  headerText?: string;
  onPressItem?: (id: string | number) => void;
};

export default function GymsList({ data, headerText, onPressItem }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        headerText ? (
          <Text
            className={
              isDark
                ? 'text-textSecondary-dark px-4 mb-2'
                : 'text-textSecondary px-4 mb-2'
            }
          >
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
      ItemSeparatorComponent={() => <View className="h-px bg-border" />}
      contentContainerStyle={{ paddingBottom: 24, backgroundColor: 'transparent' }}
    />
  );
}
