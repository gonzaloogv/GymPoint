import styled from 'styled-components/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Row } from './Row';
import { palette } from '@shared/styles';

const StreakRow = styled(Row)``;

const StreakText = styled.Text`
  margin-left: 6px;
  font-weight: 600;
  color: ${palette.warningIcon};
`;

type Props = {
  streak: number;
  size?: number;
};

export function StreakDisplay({ streak, size = 16 }: Props) {
  return (
    <StreakRow>
      <MaterialCommunityIcons name="fire" size={size} color={palette.warningIcon} />
      <StreakText>Racha: {streak} días</StreakText>
    </StreakRow>
  );
}
