import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

interface PhysicalProgressHeaderProps {
  onBack: () => void;
  onInfo: () => void;
}

const HeaderContainer = styled.View`
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #f3f4f6;
`;

const BackButtonRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const BackButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
`;

const BackIcon = styled.Text`
  font-size: 16px;
  color: #3b82f6;
  margin-right: 4px;
`;

const BackText = styled.Text`
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const ActionButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
`;

export const PhysicalProgressHeader: React.FC<PhysicalProgressHeaderProps> = ({
  onBack,
  onInfo,
}) => {
  return (
    <HeaderContainer>
      <BackButtonRow>
        <BackButton onPress={onBack}>
          <BackIcon>←</BackIcon>
          <BackText>Volver al progreso</BackText>
        </BackButton>
      </BackButtonRow>

      <TitleRow>
        <Title>Progreso Físico</Title>
        <ActionButton onPress={onInfo}>
          <Ionicons name="information-circle-outline" size={24} color="#6b7280" />
        </ActionButton>
      </TitleRow>
    </HeaderContainer>
  );
};
