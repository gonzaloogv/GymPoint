// src/features/progress/presentation/ui/components/TokenSummaryCards.tsx
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';

type Props = {
  available: number;
  totalEarned: number;
  totalSpent: number;
};

const Container = styled(View)`
  flex-direction: row;
  gap: 12px;
  padding: 0 16px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const Card = styled(View)<{ bgColor: string }>`
  flex: 1;
  background-color: ${({ bgColor }) => bgColor};
  border-radius: 12px;
  padding: 16px 12px;
  gap: 8px;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const Label = styled(Text)`
  font-size: 13px;
  color: #666;
  font-weight: 500;
`;

const Value = styled(Text)`
  font-size: 24px;
  font-weight: 700;
  color: #111;
`;

const Suffix = styled(Text)`
  font-size: 13px;
  color: #666;
  margin-left: 4px;
`;

export function TokenSummaryCards({ available, totalEarned, totalSpent }: Props) {
  return (
    <Container>
      <Card bgColor="#E8F5E9">
        <Row>
          <Label>Disponibles</Label>
          <FeatherIcon name="zap" size={14} color="#4CAF50" />
        </Row>
        <Row>
          <Value>{available}</Value>
          <Suffix>tokens</Suffix>
        </Row>
      </Card>

      <Card bgColor="#E3F2FD">
        <Row>
          <Label>Ganados</Label>
          <FeatherIcon name="trending-up" size={14} color="#2196F3" />
        </Row>
        <Row>
          <Value>{totalEarned}</Value>
          <Suffix>total</Suffix>
        </Row>
      </Card>

      <Card bgColor="#FCE4EC">
        <Row>
          <Label>Gastados</Label>
          <FeatherIcon name="gift" size={14} color="#E91E63" />
        </Row>
        <Row>
          <Value>{totalSpent}</Value>
          <Suffix>total</Suffix>
        </Row>
      </Card>
    </Container>
  );
}
