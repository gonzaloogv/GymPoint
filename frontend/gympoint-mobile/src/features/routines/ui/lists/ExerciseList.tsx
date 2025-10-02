import React from 'react';
import styled from 'styled-components/native';
import { Card, MetaChip } from '@shared/components/ui';
import type { Exercise } from '../../types';

const CardInner = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const ExRow = styled.View`
  padding: ${({ theme }) => theme.spacing(1)}px 0;
`;

const ExName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

const ExMeta = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const Chips = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Separator = styled.View`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing(1)}px 0;
`;

type Props = {
  exercises: Exercise[];
};

export function ExerciseList({ exercises }: Props) {
  const renderItem = ({ item }: { item: Exercise }) => (
    <Card style={{ marginHorizontal: 16 }}>
      <CardInner>
        <ExRow>
          <ExName>{item.name}</ExName>
          <ExMeta>{`Series: ${item.sets} • Reps: ${item.reps} • Descanso: ${item.rest}s`}</ExMeta>
        </ExRow>
        <Chips>
          {item.muscleGroups.map((m) => (
            <MetaChip key={m}>{m}</MetaChip>
          ))}
        </Chips>
      </CardInner>
    </Card>
  );

  const keyExtractor = (item: Exercise) => item.id;

  return {
    renderItem,
    keyExtractor,
    ItemSeparatorComponent: () => <Separator />,
  };
}
