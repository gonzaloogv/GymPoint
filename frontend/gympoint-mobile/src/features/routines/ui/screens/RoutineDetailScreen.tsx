import React from 'react';
import { useRoutineById } from '@features/routines/hooks/useRoutineById';
import { Routine, Exercise } from '@features/routines/types';
import { RoutineDetailLayout } from '@features/routines/ui/layouts/RoutineDetailLayout';
import { RoutineDetailHeader } from '@features/routines/ui/headers/RoutineDetailHeader';
import { RoutineDetailFooter } from '@features/routines/ui/footers/RoutineDetailFooter';
import { ExerciseList } from '@features/routines/ui/lists/ExerciseList';


export default function RoutineDetailScreen({ route, navigation }: any) {
  const id = route?.params?.id as string | undefined;
  const routine: Routine = useRoutineById(id);

  const exerciseList = ExerciseList({ exercises: routine.exercises });

  const headerComponent = <RoutineDetailHeader routine={routine} />;

  const footerComponent = (
    <RoutineDetailFooter
      onStartRoutine={() => navigation?.navigate?.('RoutineExecution', { id: routine.id })}
      onViewHistory={() => navigation?.navigate?.('RoutineHistory', { id: routine.id })}
    />
  );

  return (
    <RoutineDetailLayout
      data={routine.exercises}
      keyExtractor={exerciseList.keyExtractor}
      renderItem={exerciseList.renderItem}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={footerComponent}
      ItemSeparatorComponent={exerciseList.ItemSeparatorComponent}
      contentContainerStyle={{ paddingBottom: 96 }}
    />
  );
}
