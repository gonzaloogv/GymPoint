import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useRoutineExecution } from '@features/routines/presentation/hooks/useRoutineExecution';
import { ExpandableExerciseCard, ExerciseSelector, FloatingTimer } from '@features/routines/presentation/ui/components';
import { ExecutionLayout } from '@features/routines/presentation/ui/layouts';
import { ExecutionHeader } from '@features/routines/presentation/ui/headers';
import { ExecutionFooter } from '@features/routines/presentation/ui/footers';
import { useTheme } from '@shared/hooks';

type RoutineExecutionScreenProps = {
  route: { params?: { id?: string; restoreState?: any } };
  navigation: any;
};

/**
 * Pantalla de ejecución de rutina
 * Muestra todos los ejercicios de forma expandible
 * Soporta restauración desde sesiones incompletas
 */
const RoutineExecutionScreen: React.FC<RoutineExecutionScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#111827' : '#f9fafb';

  // Estado del modal de selección de ejercicios
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const id = route?.params?.id;
  const restoreState = route?.params?.restoreState;

  const {
    routineId,
    routineName,
    exercises,
    exerciseStates,
    expandedExercises,
    timerState,
    currentTimerExerciseId,
    duration,
    totalVolume,
    setsCompleted,
    totalSets,
    toggleExerciseExpand,
    updateSet,
    addSet,
    markSetDone,
    skipTimer,
    addExercise,
    completeRoutine,
    discardRoutine,
  } = useRoutineExecution({ id, restoreState });

  /**
   * Manejar finalización de la rutina
   */
  const handleCompleteRoutine = () => {
    if (setsCompleted < totalSets) {
      Alert.alert(
        'Entrenamiento incompleto',
        `Has completado ${setsCompleted} de ${totalSets} series. ¿Deseas finalizar de todas formas?`,
        [
          { text: 'Continuar', style: 'cancel' },
          {
            text: 'Finalizar',
            onPress: () => {
              const stats = completeRoutine();
              navigation.navigate('RoutineCompleted', stats);
            },
          },
        ]
      );
    } else {
      const stats = completeRoutine();
      navigation.navigate('RoutineCompleted', stats);
    }
  };

  /**
   * Manejar descarte de entrenamiento
   */
  const handleDiscardRoutine = () => {
    discardRoutine();
    navigation.goBack();
  };

  /**
   * Manejar agregar ejercicio
   */
  const handleAddExercise = () => {
    setShowExerciseSelector(true);
  };

  /**
   * Manejar selección de ejercicio
   */
  const handleSelectExercise = (exerciseId: string) => {
    addExercise(exerciseId);
  };

  /**
   * Header component
   */
  const headerComponent = (
    <ExecutionHeader
      routineName={routineName}
      duration={duration}
      totalVolume={totalVolume}
      setsCompleted={setsCompleted}
      totalSets={totalSets}
      onTerminate={handleCompleteRoutine}
    />
  );

  /**
   * Footer component
   */
  const footerComponent = (
    <ExecutionFooter
      onAddExercise={handleAddExercise}
      onDiscardWorkout={handleDiscardRoutine}
    />
  );

  /**
   * Renderizar item - ExpandableExerciseCard para cada ejercicio
   */
  const renderItem = ({ item }: { item: any }) => {
    const exerciseState = exerciseStates[item.id];
    const isExpanded = expandedExercises[item.id];

    if (!exerciseState) {
      return null;
    }

    return (
      <ExpandableExerciseCard
        exercise={item}
        isExpanded={isExpanded}
        onToggleExpand={() => toggleExerciseExpand(item.id)}
        sets={exerciseState.sets}
        onUpdateSet={(setIndex: number, data: any) => updateSet(item.id, setIndex, data)}
        onAddSet={() => addSet(item.id)}
        onMarkSetDone={(setIndex: number) => markSetDone(item.id, setIndex)}
      />
    );
  };

  // Obtener nombre del ejercicio actual para el timer
  const currentExerciseId = currentTimerExerciseId;
  const currentExercise = exercises.find((e) => e.id === currentExerciseId);
  const currentExerciseName = currentExercise?.name || 'Ejercicio';

  return (
    <View className="flex-1">
      <ExecutionLayout
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        contentContainerStyle={{
          paddingBottom: 24,
          backgroundColor: bgColor,
        }}
        style={{ backgroundColor: bgColor }}
      />

      {/* Floating Timer - Sticky at bottom */}
      <FloatingTimer
        timerState={timerState}
        exerciseName={currentExerciseName}
        onSkip={skipTimer}
      />

      {/* Exercise Selector Modal */}
      <ExerciseSelector
        visible={showExerciseSelector}
        allExercises={exercises}
        addedExerciseIds={Object.keys(exerciseStates)}
        onSelect={handleSelectExercise}
        onClose={() => setShowExerciseSelector(false)}
      />
    </View>
  );
};

export default RoutineExecutionScreen;