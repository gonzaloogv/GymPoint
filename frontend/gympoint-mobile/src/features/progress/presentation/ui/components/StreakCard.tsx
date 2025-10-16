import React from 'react';
import styled from 'styled-components/native';
import { sp, rad } from '@shared/styles';

interface StreakCardProps {
  icon: string;
  label: string;
  value: string;
  change: number;
}

const Container = styled.View`
  background-color: #ffffff;
  border-radius: ${({ theme }) => rad(theme, 'lg', 12)}px;
  padding: ${({ theme }) => sp(theme, 2)}px;
  border-width: 1px;
  border-color: #e5e7eb;
  flex: 1;
  min-height: 100px;
  justify-content: space-between;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: ${({ theme }) => sp(theme, 1)}px;
`;

const Icon = styled.Text`
  font-size: 20px;
`;

const Label = styled.Text`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
`;

const Value = styled.Text`
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin-bottom: ${({ theme }) => sp(theme, 0.5)}px;
`;

const ChangeContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ChangeIcon = styled.Text<{ $positive: boolean }>`
  font-size: 14px;
  color: ${({ $positive }) => ($positive ? '#10b981' : '#ef4444')};
`;

const ChangeText = styled.Text<{ $positive: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? '#10b981' : '#ef4444')};
`;

export const StreakCard: React.FC<StreakCardProps> = ({
  icon,
  label,
  value,
  change,
}) => {
  const isPositive = change >= 0;

  return (
    <Container>
      <Header>
        <Icon>{icon}</Icon>
        <Label>{label}</Label>
      </Header>
      <Value>{value}</Value>
      <ChangeContainer>
        <ChangeIcon $positive={isPositive}>{isPositive ? '↗' : '↘'}</ChangeIcon>
        <ChangeText $positive={isPositive}>{Math.abs(change)}</ChangeText>
      </ChangeContainer>
    </Container>
  );
};
