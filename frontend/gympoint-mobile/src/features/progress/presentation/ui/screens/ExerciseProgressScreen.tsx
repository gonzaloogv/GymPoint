import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SurfaceScreen, InfoCard, EmptyState, ScreenHeader } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { ExercisePRCard, ExerciseAveragesCard, ExerciseHistoryList, ExerciseFilter } from '../components/exerciseprogress';
import { useExerciseProgress, type ExerciseHistoryItem } from '../../hooks/useExerciseProgress';

type ExerciseProgressScreenProps = {
  navigation: any;
};

export function ExerciseProgressScreen({ navigation }: ExerciseProgressScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [selectedMuscularGroup, setSelectedMuscularGroup] = useState<string | null>(null);

  const { loading, error, getAllExerciseHistory } = useExerciseProgress();
  const [allHistory, setAllHistory] = useState<ExerciseHistoryItem[]>([]);

  const loadAllHistory = useCallback(async () => {
    const data = await getAllExerciseHistory();
    setAllHistory(data);
  }, [getAllExerciseHistory]);

  useEffect(() => {
    loadAllHistory();
  }, [loadAllHistory]);

  const exercises = useMemo(() => {
    const exerciseMap = new Map<number, { id_exercise: number; exercise_name: string; muscular_group: string }>();
    allHistory.forEach((item) => {
      if (!exerciseMap.has(item.id_exercise)) {
        exerciseMap.set(item.id_exercise, {
          id_exercise: item.id_exercise,
          exercise_name: item.exercise_name,
          muscular_group: item.muscular_group,
        });
      }
    });
    return Array.from(exerciseMap.values());
  }, [allHistory]);

  const filteredHistory = useMemo(() => {
    let filtered = allHistory;

    if (selectedMuscularGroup) {
      filtered = filtered.filter((item) => item.muscular_group === selectedMuscularGroup);
    }

    if (selectedExerciseId) {
      filtered = filtered.filter((item) => item.id_exercise === selectedExerciseId);
    }

    return filtered;
  }, [allHistory, selectedMuscularGroup, selectedExerciseId]);

  const metrics = useMemo(() => {
    if (filteredHistory.length === 0) {
      return {
        personalRecord: null,
        averages: null,
        history: [],
      };
    }

    const pr = filteredHistory.reduce((max, item) =>
      item.total_volume > (max?.total_volume || 0) ? item : max,
    );

    const totalWeight = filteredHistory.reduce((sum, item) => sum + item.used_weight, 0);
    const totalReps = filteredHistory.reduce((sum, item) => sum + item.reps, 0);
    const totalVolume = filteredHistory.reduce((sum, item) => sum + item.total_volume, 0);

    const averages = {
      average_weight: totalWeight / filteredHistory.length,
      average_reps: totalReps / filteredHistory.length,
      average_volume: totalVolume / filteredHistory.length,
      total_records: filteredHistory.length,
    };

    const personalRecord = {
      date: pr.date,
      used_weight: pr.used_weight,
      reps: pr.reps,
      total_volume: pr.total_volume,
    };

    return {
      personalRecord,
      averages,
      history: filteredHistory,
    };
  }, [filteredHistory]);

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const currentExerciseName = useMemo(() => {
    if (selectedExerciseId) {
      const exercise = exercises.find((ex) => ex.id_exercise === selectedExerciseId);
      return exercise?.exercise_name || 'Ejercicio';
    }
    if (selectedMuscularGroup) {
      return selectedMuscularGroup;
    }
    return 'Todos los ejercicios';
  }, [selectedExerciseId, selectedMuscularGroup, exercises]);

  return (
    <SurfaceScreen
      scroll
      contentContainerStyle={{
        paddingBottom: 48,
      }}
    >
      <ScreenHeader title={currentExerciseName} onBack={handleBackPress} />

      <View className="px-4 pt-4 pb-6 gap-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text
              className="text-[28px] font-extrabold"
              style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
            >
              Progreso por ejercicio
            </Text>
            <Text
              className="mt-2 text-xs font-semibold uppercase"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 1.2 }}
            >
              PRs, volumen y mejoras técnicas
            </Text>
          </View>
          <Ionicons name="trending-up" size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
        </View>

        <View
          className="h-px rounded-full"
          style={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)' }}
        />
      </View>

      {exercises.length > 0 && (
        <ExerciseFilter
          exercises={exercises}
          selectedExerciseId={selectedExerciseId}
          selectedMuscularGroup={selectedMuscularGroup}
          onExerciseSelect={setSelectedExerciseId}
          onMuscularGroupSelect={setSelectedMuscularGroup}
        />
      )}

      {loading && allHistory.length === 0 && (
        <View className="px-4 pb-4">
          <InfoCard variant="compact" className="flex-row items-center gap-3">
            <ActivityIndicator size="small" color={isDark ? '#F9FAFB' : '#111827'} />
            <Text className={isDark ? 'text-gray-300' : 'text-gray-600'}>Cargando historial...</Text>
          </InfoCard>
        </View>
      )}

      {error && !loading && (
        <View className="px-4 pb-4">
          <InfoCard
            variant="compact"
            style={{
              borderColor: isDark ? 'rgba(248, 113, 113, 0.45)' : '#FECACA',
              backgroundColor: isDark ? 'rgba(127, 29, 29, 0.35)' : '#FEF2F2',
            }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className={`flex-1 text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>
                {error}
              </Text>
            </View>
          </InfoCard>
        </View>
      )}

      {!loading && allHistory.length === 0 && (
        <View className="px-4 pb-6">
          <EmptyState
            title="No hay registros de ejercicios"
            description="Comienza a registrar tu progreso para ver tus métricas."
          />
        </View>
      )}

      {!loading && allHistory.length > 0 && filteredHistory.length === 0 && (
        <View className="px-4 pb-4">
          <InfoCard variant="compact">
            <View className="flex-row items-center gap-3">
              <Ionicons name="filter-outline" size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <View className="flex-1">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                >
                  No hay resultados
                </Text>
                <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Prueba con otros filtros para ver diferentes ejercicios.
                </Text>
              </View>
            </View>
          </InfoCard>
        </View>
      )}

      {!loading && filteredHistory.length > 0 && (
        <View className="gap-4 px-4">
          <ExercisePRCard
            exerciseName={currentExerciseName}
            personalRecord={metrics.personalRecord}
            loading={false}
          />
          <ExerciseAveragesCard averages={metrics.averages} loading={false} />
          <ExerciseHistoryList history={metrics.history} loading={false} />
        </View>
      )}

      <View className="h-6" />
    </SurfaceScreen>
  );
}
