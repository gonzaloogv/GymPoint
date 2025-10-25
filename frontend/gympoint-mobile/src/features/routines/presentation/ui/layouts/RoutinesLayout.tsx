import React from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@shared/hooks';

type Props = {
  data: any[];
  keyExtractor: (item: any) => string;
  renderItem: ({ item }: { item: any }) => React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  contentContainerStyle?: any;
};

export function RoutinesLayout({
  data,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListEmptyComponent,
  ListFooterComponent,
  contentContainerStyle,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#111827' : '#f9fafb';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1" style={{ backgroundColor: bgColor }}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={contentContainerStyle}
      />
    </SafeAreaView>
  );
}
