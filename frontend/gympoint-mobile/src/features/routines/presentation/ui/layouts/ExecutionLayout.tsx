import React from 'react';
import { FlatList, View } from 'react-native';

type Props = {
  data: any[];
  keyExtractor: (item: any) => string;
  renderItem: ({ item }: { item: any }) => React.ReactElement | null;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  contentContainerStyle?: any;
};

export function ExecutionLayout({
  data,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
}: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ItemSeparatorComponent={() => <View className="h-3" />}
      showsVerticalScrollIndicator={false}
      className="flex-1"
      contentContainerStyle={[
        {
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 160,
        },
        contentContainerStyle,
      ]}
    />
  );
}
