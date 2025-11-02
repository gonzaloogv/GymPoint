import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { ExercisePRCard, ExerciseAveragesCard, ExerciseHistoryList, ExerciseFilter } from '../components/exerciseprogress';
import { useExerciseProgress, type ExerciseHistoryItem } from '../../hooks/useExerciseProgress';

type ExerciseProgressScreenProps = {
  navigation: any;
};

export function ExerciseProgressScreen({ navigation }: ExerciseProgressScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Filter state
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [selectedMuscularGroup, setSelectedMuscularGroup] = useState<string | null>(null);

  // Hook for exercise data
  const { loading, error, getAllExerciseHistory } = useExerciseProgress();
  const [allHistory, setAllHistory] = useState<ExerciseHistoryItem[]>([]);

  // Load all exercise history
  const loadAllHistory = useCallback(async () => {
    const data = await getAllExerciseHistory();
    setAllHistory(data);
  }, [getAllExerciseHistory]);

  useEffect(() => {
    loadAllHistory();
  }, [loadAllHistory]);

  // Extract unique exercises from history
  const exercises = useMemo(() => {
    const exerciseMap = new Map();
    allHistory.forEach(item => {
      if (!exerciseMap.has(item.id_exercise)) {
        exerciseMap.set(item.id_exercise, {
          id_exercise: item.id_exercise,
          exercise_name: item.exercise_name,
          muscular_group: item.muscular_group
        });
      }
    });
    return Array.from(exerciseMap.values());
  }, [allHistory]);

  // Filter history based on selected filters
  const filteredHistory = useMemo(() => {
    let filtered = allHistory;

    // Filter by muscular group
    if (selectedMuscularGroup) {
      filtered = filtered.filter(item => item.muscular_group === selectedMuscularGroup);
    }

    // Filter by specific exercise
    if (selectedExerciseId) {
      filtered = filtered.filter(item => item.id_exercise === selectedExerciseId);
    }

    return filtered;
  }, [allHistory, selectedMuscularGroup, selectedExerciseId]);

  // Calculate metrics from filtered history
  const metrics = useMemo(() => {
    if (filteredHistory.length === 0) {
      return {
        personalRecord: null,
        averages: null,
        history: []
      };
    }

    // Find personal record (highest total volume)
    const pr = filteredHistory.reduce((max, item) =>
      item.total_volume > (max?.total_volume || 0) ? item : max
    );

    // Calculate averages
    const totalWeight = filteredHistory.reduce((sum, item) => sum + item.used_weight, 0);
    const totalReps = filteredHistory.reduce((sum, item) => sum + item.reps, 0);
    const totalVolume = filteredHistory.reduce((sum, item) => sum + item.total_volume, 0);

    const averages = {
      average_weight: totalWeight / filteredHistory.length,
      average_reps: totalReps / filteredHistory.length,
      average_volume: totalVolume / filteredHistory.length,
      total_records: filteredHistory.length
    };

    const personalRecord = {
      date: pr.date,
      used_weight: pr.used_weight,
      reps: pr.reps,
      total_volume: pr.total_volume
    };

    return {
      personalRecord,
      averages,
      history: filteredHistory
    };
  }, [filteredHistory]);

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  // Get current exercise name for header
  const currentExerciseName = useMemo(() => {
    if (selectedExerciseId) {
      const exercise = exercises.find(ex => ex.id_exercise === selectedExerciseId);
      return exercise?.exercise_name || 'Ejercicio';
    }
    if (selectedMuscularGroup) {
      return selectedMuscularGroup;
    }
    return 'Todos los ejercicios';
  }, [selectedExerciseId, selectedMuscularGroup, exercises]);

  return (
    <Screen scroll safeAreaTop>
      <View className="min-h-full">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-4">
          <Pressable onPress={handleBackPress} className="flex-row items-center">
            <Ionicons
              name="chevron-back"
              size={28}
              color={isDark ? '#60A5FA' : '#3B82F6'}
            />
            <Text className={`ml-1 text-base font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Volver
            </Text>
          </Pressable>
        </View>

        <View className="px-4 mb-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentExerciseName}
          </Text>
          <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Historial y métricas de progreso
          </Text>
        </View>
          {/* Exercise Filter */}
          {exercises.length > 0 && (
            <ExerciseFilter
              exercises={exercises}
              selectedExerciseId={selectedExerciseId}
              selectedMuscularGroup={selectedMuscularGroup}
              onExerciseSelect={setSelectedExerciseId}
              onMuscularGroupSelect={setSelectedMuscularGroup}
            />
          )}

          {/* Loading State */}
          {loading && allHistory.length === 0 && (
            <View className="px-4 py-12">
              <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text className={`text-center mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Cargando historial...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View className="px-4 pb-4">
              <View
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text className={`flex-1 text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                    {error}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Empty State */}
          {!loading && allHistory.length === 0 && (
            <View className="px-4 py-12">
              <View className="items-center">
                <Ionicons
                  name="barbell-outline"
                  size={64}
                  color={isDark ? '#4B5563' : '#D1D5DB'}
                />
                <Text className={`text-center mt-4 text-base font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No hay registros de ejercicios
                </Text>
                <Text className={`text-center mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Comienza a registrar tu progreso
                </Text>
              </View>
            </View>
          )}

          {/* No Results for Filter */}
          {!loading && allHistory.length > 0 && filteredHistory.length === 0 && (
            <View className="px-4 py-12">
              <View className="items-center">
                <Ionicons
                  name="filter-outline"
                  size={64}
                  color={isDark ? '#4B5563' : '#D1D5DB'}
                />
                <Text className={`text-center mt-4 text-base font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No hay resultados
                </Text>
                <Text className={`text-center mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Prueba con otros filtros
                </Text>
              </View>
            </View>
          )}

          {/* Content */}
          {!loading && filteredHistory.length > 0 && (
            <>
              {/* Personal Record Card */}
              <View className="px-4 pb-4">
                <ExercisePRCard
                  exerciseName={currentExerciseName}
                  personalRecord={metrics.personalRecord}
                  loading={false}
                />
              </View>

              {/* Averages Card */}
              <View className="px-4 pb-4">
                <ExerciseAveragesCard
                  averages={metrics.averages}
                  loading={false}
                />
              </View>

              {/* History List */}
              <View className="px-4 pb-6">
                <ExerciseHistoryList
                  history={metrics.history}
                  loading={false}
                />
              </View>
            </>
          )}

        <View className="h-4" />
      </View>
    </Screen>
  );
}
