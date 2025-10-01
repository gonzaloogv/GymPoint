import React from 'react';

import { Exercise } from '../../types';
import {
  ExerciseCard,
  CardContent,
  ExerciseName,
  ExerciseMeta,
  SetsRow,
  SetPill,
  SetLabel,
} from '../styles/execution';
import { Card } from '../../../../shared/components/ui';

type ExerciseDetailsProps = {
  exercise: Exercise;
  totalSets: number;
  currentSet: number;
  restSeconds: number;
};

export const ExerciseDetails: React.FC<ExerciseDetailsProps> = ({
  exercise,
  totalSets,
  currentSet,
  restSeconds,
}) => (
  <ExerciseCard>
    <Card>
      <CardContent>
        <ExerciseName>{exercise.name}</ExerciseName>
        <ExerciseMeta>
          {`Series: ${totalSets} • Reps objetivo: ${exercise.reps} • Descanso: ${exercise.rest}s`}
        </ExerciseMeta>

        <SetsRow>
          {Array.from({ length: totalSets }).map((_, index) => {
            const setNumber = index + 1;
            const done = setNumber < currentSet;
            const isCurrent = setNumber === currentSet;
            return (
              <SetPill key={setNumber} $done={done} $current={isCurrent}>
                <SetLabel $done={done}>{`Serie ${setNumber}`}</SetLabel>
              </SetPill>
            );
          })}
        </SetsRow>

        {restSeconds > 0 ? <ExerciseMeta>{`Descanso: ${restSeconds}s`}</ExerciseMeta> : null}
      </CardContent>
    </Card>
  </ExerciseCard>
);
