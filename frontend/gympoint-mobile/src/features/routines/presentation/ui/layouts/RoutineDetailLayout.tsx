import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@shared/hooks';

type Props = {
  data: any[];
  keyExtractor: (item: any) => string;
  renderItem: ({ item }: { item: any }) => React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  contentContainerStyle?: any;
  ItemSeparatorComponent?: React.ComponentType;
};

export function RoutineDetailLayout({
  data,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
  ItemSeparatorComponent,
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
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        contentContainerStyle={contentContainerStyle}
      />
    </SafeAreaView>
  );
}
