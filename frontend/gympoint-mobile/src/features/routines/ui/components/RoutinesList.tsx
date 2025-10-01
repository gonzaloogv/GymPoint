import { FlatList } from 'react-native';
import styled from 'styled-components/native';

import type { Routine } from '@features/routines/types';

import RoutineCard from './RoutineCard';

const ListWrap = styled.View`
  padding: 0 ${({ theme }) => theme.spacing(2)}px;
`;

const Separator = styled.View`
  height: ${({ theme }) => theme.spacing(1.5)}px;
`;

type Props = { routines: Routine[] };

export default function RoutinesList({ routines }: Props) {
  return (
    <ListWrap>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RoutineCard routine={item} />}
        ItemSeparatorComponent={() => <Separator />}
      />
    </ListWrap>
  );
}
