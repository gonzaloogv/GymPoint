import React from 'react';
import { useRoutineById } from '@features/routines/presentation/hooks/useRoutineById';
import { Routine, Exercise } from '@features/routines/domain/entities';
import { RoutineDetailLayout } from '@features/routines/presentation/ui/layouts/RoutineDetailLayout';
import { RoutineDetailHeader } from '@features/routines/presentation/ui/headers/RoutineDetailHeader';
import { RoutineDetailFooter } from '@features/routines/presentation/ui/footers/RoutineDetailFooter';
import { ExerciseList } from '@features/routines/presentation/ui/lists/ExerciseList';


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
