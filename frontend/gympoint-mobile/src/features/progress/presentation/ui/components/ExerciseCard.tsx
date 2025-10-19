import { TouchableOpacity, ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { ExerciseProgressDetail } from '@features/progress/domain/entities';
import { Card } from '@shared/components/ui/Card';

const Container = styled(Card)`
  margin-bottom: 12px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
`;

const Badge = styled.View`
  background-color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
  padding: 4px 8px;
  border-radius: 12px;
`;

const BadgeText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: #fff;
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`;

const StatItem = styled.View`
  flex: 1;
`;

const StatLabel = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme?.colors?.subtext ?? '#6b7280'};
  margin-bottom: 2px;
`;

const StatValue = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
`;

interface Props {
  exercise: ExerciseProgressDetail;
  onPress: () => void;
  style?: ViewStyle;
}

export function ExerciseCard({ exercise, onPress, style }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
      <Container>
        <Header>
          <Title>{exercise.exerciseName}</Title>
          <Badge>
            <BadgeText>{exercise.estimatedRM} kg RM</BadgeText>
          </Badge>
        </Header>

        <StatsRow>
          <StatItem>
            <StatLabel>Max peso</StatLabel>
            <StatValue>{exercise.personalRecords.maxWeight} kg</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Max reps</StatLabel>
            <StatValue>{exercise.personalRecords.maxReps}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Volumen semanal</StatLabel>
            <StatValue>{exercise.totalVolume} kg</StatValue>
          </StatItem>
        </StatsRow>
      </Container>
    </TouchableOpacity>
  );
}
