import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  current: number;
  goal: number;
  progressPct: number; // 0..100
  streak: number;
  onStats?: () => void;
};

const Container = styled.TouchableOpacity.attrs({
  activeOpacity: 0.7,
})`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 18px;
  gap: 4px;
  position: relative;
  border: 1px solid #e5e7eb;
`;

const StreakBadge = styled.View`
  position: absolute;
  top: 12px;
  right: 12px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background-color: #ffffff;
  border-radius: 16px;
`;

const StreakText = styled.Text`
  font-size: 13px;
  font-weight: 700;
  color: #16a34a;
`;

const Content = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
`;

const IconCircle = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #dbeafe;
  align-items: center;
  justify-content: center;
`;

const IconText = styled.Text`
  font-size: 18px;
`;

const TextContent = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
`;

const Subtitle = styled.Text`
  font-size: 19px;
  font-weight: 700;
  color: #1f2937;
  margin-top: 2px;
`;

export default function WeeklyProgressCard({
  current,
  goal,
  streak,
  onStats,
}: Props) {
  return (
    <Container onPress={onStats}>
      <StreakBadge>
        <Ionicons name="trending-up" size={14} color="#16a34a" />
        <StreakText>{streak}</StreakText>
      </StreakBadge>

      <Content>
        <IconCircle>
          <IconText>🎯</IconText>
        </IconCircle>
        <TextContent>
          <Title>Meta semanal</Title>
          <Subtitle>{current} de {goal} entrenamientos</Subtitle>
        </TextContent>
      </Content>
    </Container>
  );
}
