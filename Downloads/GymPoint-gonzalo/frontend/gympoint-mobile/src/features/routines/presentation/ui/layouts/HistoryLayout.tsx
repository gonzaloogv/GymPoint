import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

const Screen = styled(SafeAreaView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.bg};
`;

const Separator = styled.View`
  height: ${({ theme }) => theme.spacing(1.5)}px;
`;

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
    <Screen edges={['top', 'left', 'right']}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Separator />}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={contentContainerStyle}
      />
    </Screen>
  );
}
