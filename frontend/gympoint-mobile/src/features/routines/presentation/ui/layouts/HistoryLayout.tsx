import React from 'react';
import { FlatList, View } from 'react-native';

type Props = {
  data: any[];
  keyExtractor: (item: any) => string;
  renderItem: ({ item }: { item: any }) => React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: any;
};

export function HistoryLayout({
  data,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  contentContainerStyle,
}: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View className="h-3" />}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      className="flex-1"
      contentContainerStyle={[
        {
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 120,
        },
        contentContainerStyle,
      ]}
    />
  );
}
