import React from 'react';
import styled from 'styled-components/native';
import { Card } from '@shared/components/ui';
import type { RoutineSession } from '@features/routines/domain/entities';

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
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background: ${({ theme, ok }) => (ok ? theme.colors.primary : theme.colors.border)};
`;

type Props = {
  sessions: RoutineSession[];
};

export function HistoryList({ sessions }: Props) {
  const renderItem = ({ item }: { item: RoutineSession }) => (
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
  );

  const keyExtractor = (item: RoutineSession) => item.id;

  return {
    renderItem,
    keyExtractor,
  };
}
