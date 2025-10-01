import React from 'react';
import styled from 'styled-components/native';
import { StatusPill, MetaChip } from '@shared/components/ui';
import type { Routine } from '../../types';

const HeaderWrap = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.h1}px;
  font-weight: 800;
`;

const MetaRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
  align-items: center;
`;

const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  font-size: ${({ theme }) => theme.typography.body + 4}px;
  margin: ${({ theme }) => theme.spacing(1)}px ${({ theme }) => theme.spacing(2)}px;
`;

type Props = {
  routine: Routine;
  showExercisesTitle?: boolean;
};

export function RoutineDetailHeader({ routine, showExercisesTitle = true }: Props) {
  return (
    <>
      <HeaderWrap>
        <Title>{routine.name}</Title>
        <MetaRow>
          <StatusPill status={routine.status} />
          <Meta>• {routine.difficulty}</Meta>
          <Meta>• {routine.estimatedDuration} min</Meta>
          {routine.lastPerformed ? <Meta>• Última: {routine.lastPerformed}</Meta> : null}
          {routine.nextScheduled ? <Meta>• Próxima: {routine.nextScheduled}</Meta> : null}
        </MetaRow>
      </HeaderWrap>
      {showExercisesTitle && <SectionTitle>Ejercicios</SectionTitle>}
    </>
  );
}
