import React from 'react';
import { useRoutineById } from '../hooks/useRoutineById';
import { Routine, Exercise } from '../types';
import { RoutineDetailLayout } from './layouts';
import { RoutineDetailHeader } from './headers';
import { RoutineDetailFooter } from './footers';
import { ExerciseList } from './lists';


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
