import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';

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
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
      style={styles.list}
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

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  separator: {
    height: 12,
  },
});
