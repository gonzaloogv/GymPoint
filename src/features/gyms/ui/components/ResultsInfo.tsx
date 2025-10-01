import React from 'react';
import styled from 'styled-components/native';
import { sp } from '@shared/styles/uiTokens';

const InfoText = styled.Text`
  color: ${({ theme }) => theme?.colors?.subtext ?? '#6b7280'};
  padding: 0 ${({ theme }) => sp(theme, 2)}px;
  margin-top: 6px;
`;

type Props = { count: number; hasUserLocation: boolean; };
export default function ResultsInfo({ count, hasUserLocation }: Props) {
  return (
    <InfoText>
      {count} gimnasio{count !== 1 ? 's' : ''} encontrado{count !== 1 ? 's' : ''}
      {hasUserLocation ? ' ordenados por distancia' : ''}
    </InfoText>
  );
}
