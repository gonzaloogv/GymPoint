// src/features/progress/presentation/ui/components/MovementItem.tsx
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import { TokenMovement } from '../../../domain/entities/TokenMovement';

type Props = {
  movement: TokenMovement;
};

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border-bottom-width: 1px;
  border-bottom-color: #f3f4f6;
`;

const IconContainer = styled(View)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: #f3f4f6;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const Icon = styled(Text)`
  font-size: 20px;
`;

const Content = styled(View)`
  flex: 1;
  gap: 4px;
`;

const Description = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: #111;
`;

const DateText = styled(Text)`
  font-size: 13px;
  color: #666;
`;

const Amount = styled(Text)<{ type: 'earned' | 'spent' }>`
  font-size: 16px;
  font-weight: 700;
  color: ${({ type }) => (type === 'earned' ? '#2196F3' : '#E91E63')};
`;

const Badge = styled(View)<{ type: 'earned' | 'spent' }>`
  background-color: ${({ type }) => (type === 'earned' ? '#E3F2FD' : '#FCE4EC')};
  padding: 4px 10px;
  border-radius: 12px;
  margin-left: 8px;
`;

const BadgeText = styled(Text)<{ type: 'earned' | 'spent' }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ type }) => (type === 'earned' ? '#2196F3' : '#E91E63')};
`;

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate();
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function MovementItem({ movement }: Props) {
  const sign = movement.type === 'earned' ? '+' : '';
  const displayAmount = Math.abs(movement.amount);

  return (
    <Container>
      <IconContainer>
        <Icon>{movement.icon}</Icon>
      </IconContainer>
      <Content>
        <Description>{movement.description}</Description>
        <DateText>{formatDate(movement.date)}</DateText>
      </Content>
      <Badge type={movement.type}>
        <BadgeText type={movement.type}>
          {sign} {displayAmount}
        </BadgeText>
      </Badge>
    </Container>
  );
}
