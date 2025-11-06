import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';

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
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      style={styles.list}
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

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  separator: {
    height: 12,
  },
});
