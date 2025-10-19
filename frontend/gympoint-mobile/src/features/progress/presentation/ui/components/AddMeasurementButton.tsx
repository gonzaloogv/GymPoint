import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddMeasurementButtonProps {
  onPress: () => void;
}

const Button = styled(TouchableOpacity)`
  background-color: #3b82f6;
  border-radius: 12px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
`;

const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
`;

export const AddMeasurementButton: React.FC<AddMeasurementButtonProps> = ({ onPress }) => {
  return (
    <Button onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
      <ButtonText>Añadir medición</ButtonText>
    </Button>
  );
};
