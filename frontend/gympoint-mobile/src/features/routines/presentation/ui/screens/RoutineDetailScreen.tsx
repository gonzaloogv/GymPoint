import React, { useState } from 'react';
import { useRoutineById } from '@features/routines/presentation/hooks/useRoutineById';
import { Routine, Exercise } from '@features/routines/domain/entities';
import { RoutineDetailLayout } from '@features/routines/presentation/ui/layouts/RoutineDetailLayout';
import { RoutineDetailHeader } from '@features/routines/presentation/ui/headers/RoutineDetailHeader';
import { RoutineDetailFooter } from '@features/routines/presentation/ui/footers/RoutineDetailFooter';
import { ExpandableExerciseDetail } from '@features/routines/presentation/ui/components/ExpandableExerciseDetail';

/**
 * Pantalla de detalle de rutina
 * Muestra la información de la rutina con lista de ejercicios expandibles
 * Cada ejercicio puede expandirse para ver detalles adicionales
 */
export default function RoutineDetailScreen({ route, navigation }: any) {
  const id = route?.params?.id as string | undefined;
  const routine: Routine = useRoutineById(id);

  // Estado para manejar qué ejercicios están expandidos
  const [expandedExercises, setExpandedExercises] = useState<{ [key: string]: boolean }>({});

  const toggleExerciseExpand = (exerciseId: string) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const headerComponent = <RoutineDetailHeader routine={routine} />;

  const footerComponent = (
    <RoutineDetailFooter
      onStartRoutine={() =>
        navigation?.navigate?.('RoutineExecution', { id: routine.id })
      }
      onViewHistory={() => navigation?.navigate?.('RoutineHistory', { id: routine.id })}
    />
  );

  const renderItem = ({ item }: { item: Exercise }) => (
    <ExpandableExerciseDetail
      exercise={item}
      isExpanded={expandedExercises[item.id] || false}
      onToggle={() => toggleExerciseExpand(item.id)}
    />
  );

  return (
    <RoutineDetailLayout
      data={routine.exercises}
      keyExtractor={(item: Exercise) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={footerComponent}
      contentContainerStyle={{ paddingBottom: 96, paddingTop: 16 }}
    />
  );
}
