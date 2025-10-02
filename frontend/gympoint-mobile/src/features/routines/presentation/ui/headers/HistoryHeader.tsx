import React from 'react';
import styled from 'styled-components/native';
import { H1 } from '@shared/components/ui';

const Header = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(0.5)}px;
`;

const Sub = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
`;

type Props = {
  routineName: string;
  sessionsCount: number;
};

export function HistoryHeader({ routineName, sessionsCount }: Props) {
  return (
    <Header>
      <H1>Historial</H1>
      <Sub>{routineName}</Sub>
      <Sub>{sessionsCount} sesiones registradas</Sub>
    </Header>
  );
}
