import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Row } from './Row';

const StreakRow = styled(Row)``;

const StreakText = styled.Text`
  margin-left: ${({ theme }) => theme.spacing(0.75)}px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.warning || '#ea580c'};
`;

type Props = {
  streak: number;
  size?: number;
  color?: string;
};

export function StreakDisplay({ streak, size = 16, color }: Props) {
  const iconColor = color || '#ea580c';
  
  return (
    <StreakRow>
      <MaterialCommunityIcons name="fire" size={size} color={iconColor} />
      <StreakText>Racha: {streak} días</StreakText>
    </StreakRow>
  );
}
