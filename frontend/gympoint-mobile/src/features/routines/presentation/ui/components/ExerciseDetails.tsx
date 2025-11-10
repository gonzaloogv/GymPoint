import React from 'react';
import { View } from 'react-native';
import { Exercise } from '@features/routines/domain/entities';
import { BackButton } from '@shared/components/ui/BackButton';
import { ExerciseCard as SharedExerciseCard } from './ExerciseCard';

type ExerciseDetailsProps = {
  exercise: Exercise;
  totalSets: number;
  currentSet: number;
  restSeconds: number;
  onBack?: () => void;
};

export const ExerciseDetails: React.FC<ExerciseDetailsProps> = ({
  exercise,
  totalSets,
  currentSet,
  restSeconds,
  onBack,
}) => (
  <View className="gap-4">
    {onBack && <BackButton onPress={onBack} />}
    <SharedExerciseCard
      exercise={exercise}
      totalSets={totalSets}
      currentSet={currentSet}
      restSeconds={restSeconds}
    />
  </View>
);
