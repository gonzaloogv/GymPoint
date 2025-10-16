import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

const Container = styled.View`
  padding: 16px;
  background-color: ${({ theme }) => theme?.colors?.bg ?? '#fff'};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme?.colors?.border ?? '#e5e7eb'};
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BackButton = styled(TouchableOpacity)`
  margin-right: 12px;
  padding: 4px;
`;

const BackIcon = styled.Text`
  font-size: 20px;
  color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
`;

const BackText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
  margin-left: 4px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
  flex: 1;
`;

interface Props {
  onBack: () => void;
}

export function AchievementHeader({ onBack }: Props) {
  return (
    <Container>
      <Row>
        <BackButton onPress={onBack}>
          <Row>
            <BackIcon>←</BackIcon>
            <BackText>Volver al progreso</BackText>
          </Row>
        </BackButton>
      </Row>
      <Title>Logros</Title>
    </Container>
  );
}
