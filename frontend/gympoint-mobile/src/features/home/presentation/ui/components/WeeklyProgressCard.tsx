import { View } from 'react-native';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui';
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

      <View className="flex-row justify-between items-center">
        <StreakDisplay streak={streak} />
        <Button variant="primary" className="min-h-10" onPress={onStats}>
          Ver estadísticas
        </Button>
      </View>
    </Card>
  );
}
