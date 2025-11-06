import React, { useState } from 'react';
import { useRoutineById } from '@features/routines/presentation/hooks/useRoutineById';
import { RoutineExercise } from '@features/routines/domain/entities';
import { RoutineDetailLayout } from '@features/routines/presentation/ui/layouts/RoutineDetailLayout';
import { RoutineDetailHeader } from '@features/routines/presentation/ui/headers/RoutineDetailHeader';
import { RoutineDetailFooter } from '@features/routines/presentation/ui/footers/RoutineDetailFooter';
import { ExpandableExerciseDetail } from '@features/routines/presentation/ui/components/ExpandableExerciseDetail';
import { ActivityIndicator, View, Text, Alert } from 'react-native';
import { useRoutinesStore } from '@features/routines/presentation/state/routines.store';

/**
 * Pantalla de detalle de rutina
 * Muestra la información de la rutina con lista de ejercicios expandibles
 * Cada ejercicio puede expandirse para ver detalles adicionales
 */
export default function RoutineDetailScreen({ route, navigation }: any) {
  const id = route?.params?.id as string | undefined;
  const routineId = id ? parseInt(id, 10) : undefined;
  const { routine, loading } = useRoutineById(routineId);
  const { deleteRoutine } = useRoutinesStore();

  // Estado para manejar qué ejercicios están expandidos
  const [expandedExercises, setExpandedExercises] = useState<{ [key: number]: boolean }>({});

  const toggleExerciseExpand = (exerciseId: number) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  if (loading || !routine) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        {!routine && !loading && <Text>Rutina no encontrada</Text>}
      </View>
    );
  }

  const headerComponent = <RoutineDetailHeader routine={routine} />;

  const footerComponent = (
    <RoutineDetailFooter
      onStartRoutine={() =>
        navigation?.navigate?.('RoutineExecution', { id: routine.id_routine.toString() })
      }
      onViewHistory={() => navigation?.navigate?.('RoutineHistory', { id: routine.id_routine.toString() })}
    />
  );

  const renderItem = ({ item }: { item: RoutineExercise }) => (
    <ExpandableExerciseDetail
      exercise={item}
      isExpanded={expandedExercises[item.id_exercise] || false}
      onToggle={() => toggleExerciseExpand(item.id_exercise)}
    />
  );

  return (
    <RoutineDetailLayout
      data={routine.exercises || []}
      keyExtractor={(item: RoutineExercise) => item.id_exercise.toString()}
      renderItem={renderItem}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={footerComponent}
      contentContainerStyle={{ paddingBottom: 96, paddingTop: 16 }}
    />
  );
}
