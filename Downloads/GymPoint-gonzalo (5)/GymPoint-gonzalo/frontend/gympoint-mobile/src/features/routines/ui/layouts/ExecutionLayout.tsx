import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

const Screen = styled(SafeAreaView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.bg};
`;

type Props = {
  data: any[];
  keyExtractor: (item: any) => string;
  renderItem: ({ item }: { item: any }) => React.ReactElement;
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
    <Screen edges={['top', 'left', 'right']}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={contentContainerStyle}
      />
    </Screen>
  );
}
