import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useRoutineById } from '../hooks/useRoutineById';
import { useRoutineHistory } from '../hooks/useRoutineHistory';
import { RoutineSession } from '../types';
import { Card, H1 } from '@shared/components/ui';

const Screen = styled(SafeAreaView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.bg};
`;

const Header = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(0.5)}px;
`;

const Sub = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
`;

const ItemInner = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(0.5)}px;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const Dot = styled.View<{ ok?: boolean }>`
  width: 10px; height: 10px; border-radius: 5px;
  background: ${({ theme, ok }) => (ok ? theme.colors.primary : theme.colors.border)};
`;

const Separator = styled.View`
  height: ${({ theme }) => theme.spacing(1.5)}px;
`;

export default function RoutineHistoryScreen({ route }: any) {
  const id = route?.params?.id as string | undefined;
  const routine = useRoutineById(id);
  const { items } = useRoutineHistory(routine.id);

  const header = (
    <Header>
      <H1>Historial</H1>
      <Sub>{routine.name}</Sub>
      <Sub>{items.length} sesiones registradas</Sub>
    </Header>
  );

  return (
    <Screen edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(i: RoutineSession) => i.id}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <Separator />}
        renderItem={({ item }) => (
          <Card style={{ marginHorizontal: 16 }}>
            <ItemInner>
              <Row>
                <Label>{new Date(item.date).toLocaleString()}</Label>
                <Dot ok={item.completed} />
              </Row>
              <Meta>Duración: {item.durationMin} min</Meta>
              <Meta>{item.completed ? 'Completada' : 'Incompleta'}</Meta>
            </ItemInner>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </Screen>
  );
}
