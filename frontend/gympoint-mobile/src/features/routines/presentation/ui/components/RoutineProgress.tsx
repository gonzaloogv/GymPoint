import { useMemo } from 'react';
import { View } from 'react-native';
import { Card, ProgressSection } from '@shared/components/ui';

type Props = { completed: number; goal: number };

export default function RoutineProgress({ completed, goal }: Props) {
  const progressPct = useMemo(
    () => Math.max(0, Math.min(100, (completed / Math.max(1, goal)) * 100)),
    [completed, goal],
  );

  return (
    <View className="px-4 mb-4">
      <Card>
        <ProgressSection
          current={completed}
          goal={goal}
          progressPct={progressPct}
          label="Progreso semanal"
          description={`${completed}/${goal} entrenamientos`}
        />
      </Card>
    </View>
  );
}
