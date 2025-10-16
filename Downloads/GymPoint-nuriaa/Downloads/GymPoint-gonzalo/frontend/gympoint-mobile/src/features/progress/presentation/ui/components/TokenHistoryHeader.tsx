// src/features/progress/presentation/ui/components/TokenHistoryHeader.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  onBack: () => void;
};

const Container = styled(View)`
  padding: 16px;
  background-color: #fff;
  border-bottom-width: 1px;
  border-bottom-color: #f3f4f6;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
`;

const BackIcon = styled(Text)`
  font-size: 24px;
  color: #111;
`;

const Title = styled(Text)`
  font-size: 20px;
  font-weight: 700;
  color: #111;
`;

export function TokenHistoryHeader({ onBack }: Props) {
  return (
    <Container>
      <Row>
        <BackButton onPress={onBack}>
          <BackIcon>←</BackIcon>
        </BackButton>
        <Title>Historial de tokens</Title>
        <View style={{ width: 32 }} />
      </Row>
    </Container>
  );
}
