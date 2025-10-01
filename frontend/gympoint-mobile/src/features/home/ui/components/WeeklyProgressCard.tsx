import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Badge } from '@shared/components/ui/Badge';
import { Button, ButtonText } from '@shared/components/ui/Button';
import { Card, CardRow, CardTitle, Row } from '@shared/components/ui';
import { ProgressFill, ProgressTrack } from '@shared/components/ui/ProgressBar';
import { palette } from '@shared/styles';

const HeaderRow = styled(CardRow)`
  margin-bottom: 8px;
`;

const TitleRow = styled(Row)`
  flex: 1;
`;

const TitleText = styled(CardTitle)`
  margin-left: 8px;
`;

const Body = styled.View`
  gap: 8px;
`;

const Spread = styled(Row).attrs({ $justify: 'space-between' })``;

const Subtext = styled.Text`
  color: ${({ theme }) => theme?.colors?.subtext ?? palette.textMuted};
`;

const StreakRow = styled(Row)``;

const StreakText = styled.Text`
  margin-left: 6px;
  font-weight: 600;
  color: ${palette.warningIcon};
`;

const StatsButton = styled(Button)`
  min-height: 40px;
`;

const StatsLabel = styled(ButtonText)`
  color: #ffffff;
`;

type Props = {
  current: number;
  goal: number;
  progressPct: number; // 0..100
  streak: number;
  onStats?: () => void;
};

export default function WeeklyProgressCard({
  current,
  goal,
  progressPct,
  streak,
  onStats,
}: Props) {
  return (
    <Card>
      <HeaderRow>
        <TitleRow>
          <FeatherIcon name="target" size={20} color={palette.textStrong} />
          <TitleText>Progreso semanal</TitleText>
        </TitleRow>
        <Badge variant="secondary">
          {current}/{goal}
        </Badge>
      </HeaderRow>

      <Body>
        <Spread>
          <Subtext>Meta semanal</Subtext>
          <Subtext>
            {current} de {goal} entrenamientos
          </Subtext>
        </Spread>

        <ProgressTrack>
          <ProgressFill value={progressPct} />
        </ProgressTrack>

        <Spread>
          <StreakRow>
            <MaterialCommunityIcons name="fire" size={16} color={palette.warningIcon} />
            <StreakText>Racha: {streak} días</StreakText>
          </StreakRow>
          <StatsButton onPress={onStats}>
            <StatsLabel>Ver estadísticas</StatsLabel>
          </StatsButton>
        </Spread>
      </Body>
    </Card>
  );
}
