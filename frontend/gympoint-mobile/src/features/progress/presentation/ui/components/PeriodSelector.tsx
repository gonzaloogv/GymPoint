// src/features/progress/presentation/ui/components/PeriodSelector.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';

type Props = {
  value: string;
  onPress: () => void;
};

const Container = styled(View)`
  padding: 0 16px;
  margin-bottom: 16px;
  margin-top: 16px;
`;

const Label = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin-bottom: 8px;
`;

const Selector = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  border-width: 1px;
  border-color: #e5e7eb;
`;

const ValueText = styled(Text)`
  font-size: 14px;
  color: #111;
  font-weight: 500;
`;

export function PeriodSelector({ value, onPress }: Props) {
  return (
    <Container>
      <Label>Período de tiempo</Label>
      <Selector onPress={onPress}>
        <ValueText>{value}</ValueText>
        <FeatherIcon name="chevron-down" size={20} color="#666" />
      </Selector>
    </Container>
  );
}
