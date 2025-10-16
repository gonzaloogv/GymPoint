import React from 'react';
import * as S from './MetricCard.styles';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  change: number;
  unit?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  change,
  unit,
}) => {
  const isPositive = change >= 0;

  return (
    <S.Container>
      <S.Header>
        <S.Icon>{icon}</S.Icon>
        <S.Label>{label}</S.Label>
      </S.Header>
      <S.ValueRow>
        <S.Value>{value}</S.Value>
        {unit && <S.Unit>{unit}</S.Unit>}
      </S.ValueRow>
      <S.ChangeContainer>
        <S.ChangeIcon $positive={isPositive}>{isPositive ? '↗' : '↘'}</S.ChangeIcon>
        <S.ChangeText $positive={isPositive}>{Math.abs(change)}</S.ChangeText>
      </S.ChangeContainer>
    </S.Container>
  );
};
