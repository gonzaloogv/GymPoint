import React from 'react';
import { useRoutineExecution } from '@features/routines/hooks/useRoutineExecution';
import { ExerciseDetails } from '@features/routines/ui/components';
import { ExecutionLayout } from '@features/routines/ui/layouts';
import { ExecutionHeader } from '@features/routines/ui/headers';
import { ExecutionFooter } from '@features/routines/ui/footers';

type RoutineExecutionScreenProps = {
  route: { params?: { id?: string } };
  navigation: { goBack?: () => void };
};

const RoutineExecutionScreen: React.FC<RoutineExecutionScreenProps> = ({ route, navigation }) => {
  const id = route?.params?.id;
  const {
    routineName,
    currentExercise,
    exerciseIndex,
    totalExercises,
    totalSets,
    currentSet,
    restSeconds,
    progressPct,
    goToPrevious,
    goToNext,
    completeSet,
  } = useRoutineExecution({ id, onComplete: navigation?.goBack });

  const headerComponent = (
    <ExecutionHeader
      routineName={routineName}
      exerciseIndex={exerciseIndex}
      totalExercises={totalExercises}
      progressPct={progressPct}
    />
  );

  const footerComponent = (
    <ExecutionFooter
      currentSet={currentSet}
      totalSets={totalSets}
      exerciseIndex={exerciseIndex}
      totalExercises={totalExercises}
      onCompleteSet={completeSet}
      onPrevious={goToPrevious}
      onNext={goToNext}
    />
  );

  return (
    <ExecutionLayout
      data={[currentExercise]}
      keyExtractor={(exercise) => exercise.id}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={footerComponent}
      renderItem={() => (
        <ExerciseDetails
          exercise={currentExercise}
          totalSets={totalSets}
          currentSet={currentSet}
          restSeconds={restSeconds}
        />
      )}
      contentContainerStyle={{ paddingBottom: 96 }}
    />
  );
};

export default RoutineExecutionScreen;
