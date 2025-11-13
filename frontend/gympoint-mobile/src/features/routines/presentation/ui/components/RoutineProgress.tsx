import React from 'react';
import { InfoCard, ProgressSection } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

type Props = {
  completed: number;
  goal: number;
};

export default function RoutineProgress({ completed, goal }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const progressPct = Math.max(0, Math.min(100, (completed / Math.max(1, goal)) * 100));

  return (
    <InfoCard variant="compact" className="mx-4 mb-4">
      <ProgressSection
        current={completed}
        goal={goal}
        progressPct={progressPct}
        label="Progreso semanal"
        description={`${completed}/${goal} entrenamientos`}
      />
    </InfoCard>
  );
}

