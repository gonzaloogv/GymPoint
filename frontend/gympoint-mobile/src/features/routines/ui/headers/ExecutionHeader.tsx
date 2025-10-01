import React from 'react';
import styled from 'styled-components/native';

const Header = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(0.5)}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.h1}px;
  font-weight: 800;
`;

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
`;

const ProgressTrack = styled.View`
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.muted};
  margin: ${({ theme }) => theme.spacing(1)}px 0;
`;

const ProgressBar = styled.View<{ $pct: number }>`
  width: ${({ $pct }) => `${$pct}%`};
  height: 8px;
  background: ${({ theme }) => theme.colors.primary};
`;

type Props = {
  routineName: string;
  exerciseIndex: number;
  totalExercises: number;
  progressPct: number;
};

export function ExecutionHeader({ routineName, exerciseIndex, totalExercises, progressPct }: Props) {
  return (
    <Header>
      <Title>{routineName}</Title>
      <Subtitle>{`Ejercicio ${exerciseIndex + 1} de ${totalExercises}`}</Subtitle>
      <ProgressTrack>
        <ProgressBar $pct={progressPct} />
      </ProgressTrack>
    </Header>
  );
}
