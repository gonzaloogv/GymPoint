import styled from 'styled-components/native';
import { Button, ButtonText } from '@shared/components/ui/Button';
import { Card, Row } from '@shared/components/ui';
import { CardHeader } from '@shared/components/ui/CardHeader';
import { ProgressSection } from '@shared/components/ui/ProgressSection';
import { StreakDisplay } from '@shared/components/ui/StreakDisplay';

type Props = {
  current: number;
  goal: number;
  progressPct: number; // 0..100
  streak: number;
  onStats?: () => void;
};

const Spread = styled(Row).attrs({ $justify: 'space-between' })``;

const StatsButton = styled(Button)`
  min-height: 40px;
`;

const StatsLabel = styled(ButtonText)`
  color: #ffffff;
`;

export default function WeeklyProgressCard({
  current,
  goal,
  progressPct,
  streak,
  onStats,
}: Props) {
  return (
    <Card>
      <CardHeader
        icon="target"
        title="Progreso semanal"
        badgeText={`${current}/${goal}`}
        badgeVariant="secondary"
      />

      <ProgressSection
        current={current}
        goal={goal}
        progressPct={progressPct}
        label="Meta semanal"
        description={`${current} de ${goal} entrenamientos`}
      />

      <Spread>
        <StreakDisplay streak={streak} />
        <StatsButton onPress={onStats}>
          <StatsLabel>Ver estadísticas</StatsLabel>
        </StatsButton>
      </Spread>
    </Card>
  );
}
