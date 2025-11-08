import React, { useState } from 'react';
import { Alert, View, Text, ActivityIndicator } from 'react-native';
import { useRoutineExecution } from '@features/routines/presentation/hooks/useRoutineExecution';
import {
  ExpandableExerciseCard,
  ExerciseSelector,
  FloatingTimer,
} from '@features/routines/presentation/ui/components';
import { ExecutionLayout } from '@features/routines/presentation/ui/layouts';
import { ExecutionHeader } from '@features/routines/presentation/ui/headers';
import { ExecutionFooter } from '@features/routines/presentation/ui/footers';
import { useTheme } from '@shared/hooks';
import { SurfaceScreen } from '@shared/components/ui';

type RoutineExecutionScreenProps = {
  route: { params?: { id?: string; restoreState?: any } };
  navigation: any;
};

// Componente de Loading separado para evitar inconsistencias de hooks
const LoadingScreen: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <SurfaceScreen>
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} />
      <Text style={{ color: isDark ? '#ffffff' : '#000000' }} className="mt-4">
        Cargando rutina...
      </Text>
    </View>
  </SurfaceScreen>
);

const RoutineExecutionScreen: React.FC<RoutineExecutionScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    restSeconds,
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

  // Mostrar loading si no hay datos (evita hooks inconsistentes)
  if (!routineId || exercises.length === 0) {
    return <LoadingScreen isDark={isDark} />;
  }

  const handleCompleteRoutine = () => {
    if (setsCompleted < totalSets) {
      Alert.alert(
        'Entrenamiento incompleto',
        `Has completado ${setsCompleted} de ${totalSets} series. Deseas finalizar de todas formas?`,
        [
          { text: 'Continuar', style: 'cancel' },
          {
            text: 'Finalizar',
            onPress: () => {
              const stats = completeRoutine();
              navigation.navigate('RoutineCompleted', stats);
            },
          },
        ],
      );
    } else {
      const stats = completeRoutine();
      navigation.navigate('RoutineCompleted', stats);
    }
  };

  const handleDiscardRoutine = () => {
    discardRoutine();
    navigation.goBack();
  };

  const handleAddExercise = () => {
    setShowExerciseSelector(true);
  };

  const handleSelectExercise = (exerciseId: string) => {
    addExercise(exerciseId);
  };

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

  const footerComponent = (
    <ExecutionFooter
      onAddExercise={handleAddExercise}
      onDiscardWorkout={handleDiscardRoutine}
    />
  );

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

  const currentExerciseId = currentTimerExerciseId;
  const currentExercise = exercises.find((exercise) => exercise.id === currentExerciseId);
  const currentExerciseName = currentExercise?.name || 'Ejercicio';

  return (
    <SurfaceScreen>
      <ExecutionLayout
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        contentContainerStyle={{ paddingBottom: 200 }}
      />

      <FloatingTimer
        timerState={timerState}
        restSeconds={restSeconds}
        exerciseName={currentExerciseName}
        onSkip={skipTimer}
      />

      <ExerciseSelector
        visible={showExerciseSelector}
        allExercises={exercises}
        addedExerciseIds={Object.keys(exerciseStates)}
        onSelect={handleSelectExercise}
        onClose={() => setShowExerciseSelector(false)}
      />
    </SurfaceScreen>
  );
};

export default RoutineExecutionScreen;
