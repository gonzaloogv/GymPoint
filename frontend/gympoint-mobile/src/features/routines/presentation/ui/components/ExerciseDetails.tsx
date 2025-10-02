import React from 'react';
import { Exercise } from '@features/routines/domain/entities';
import { ExerciseCard  as SharedExerciseCard} from './ExerciseCard';

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
  <SharedExerciseCard
    exercise={exercise}
    totalSets={totalSets}
    currentSet={currentSet}
    restSeconds={restSeconds}
  />
);
