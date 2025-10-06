import { useMemo } from 'react';
import styled from 'styled-components/native';
import { Card, ProgressSection } from '@shared/components/ui';

const Wrap = styled.View`
  padding: 0 ${({ theme }) => theme.spacing(2)}px;
  margin-bottom: ${({ theme }) => theme.spacing(2)}px;
`;

type Props = { completed: number; goal: number };

export default function RoutineProgress({ completed, goal }: Props) {
  const progressPct = useMemo(
    () => Math.max(0, Math.min(100, (completed / Math.max(1, goal)) * 100)),
    [completed, goal],
  );

  return (
    <Wrap>
      <Card>
        <ProgressSection
          current={completed}
          goal={goal}
          progressPct={progressPct}
          label="Progreso semanal"
          description={`${completed}/${goal} entrenamientos`}
        />
      </Card>
    </Wrap>
  );
}
