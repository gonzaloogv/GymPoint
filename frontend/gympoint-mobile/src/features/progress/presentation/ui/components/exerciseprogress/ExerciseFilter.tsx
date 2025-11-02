import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { SelectorModal } from '@shared/components/ui';
import type { SelectorItem } from '@shared/components/ui';

interface Exercise {
  id_exercise: number;
  exercise_name: string;
  muscular_group: string;
}

interface ExerciseFilterProps {
  exercises: Exercise[];
  selectedExerciseId: number | null;
  selectedMuscularGroup: string | null;
  onExerciseSelect: (exerciseId: number | null) => void;
  onMuscularGroupSelect: (group: string | null) => void;
}

const MUSCULAR_GROUPS = [
  { value: null, label: 'Todos', icon: 'apps' as const },
  { value: 'PECHO', label: 'Pecho', icon: 'body' as const },
  { value: 'ESPALDA', label: 'Espalda', icon: 'git-pull-request' as const },
  { value: 'PIERNAS', label: 'Piernas', icon: 'walk' as const },
  { value: 'HOMBROS', label: 'Hombros', icon: 'triangle' as const },
  { value: 'BRAZOS', label: 'Brazos', icon: 'fitness' as const },
  { value: 'CORE', label: 'Core', icon: 'square' as const },
];

export function ExerciseFilter({
  exercises,
  selectedExerciseId,
  selectedMuscularGroup,
  onExerciseSelect,
  onMuscularGroupSelect
}: ExerciseFilterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  // Filtrar ejercicios por grupo muscular seleccionado
  const filteredExercises = selectedMuscularGroup
    ? exercises.filter(ex => ex.muscular_group === selectedMuscularGroup)
    : exercises;

  // Convertir ejercicios a SelectorItem
  const exerciseItems: SelectorItem[] = [
    { id: 'all', label: 'Todos los ejercicios', value: null },
    ...filteredExercises.map(ex => ({
      id: ex.id_exercise.toString(),
      label: ex.exercise_name,
      value: ex.id_exercise,
      subtitle: ex.muscular_group
    }))
  ];

  const selectedExercise = exercises.find(ex => ex.id_exercise === selectedExerciseId);

  return (
    <View className="px-4 pb-4">
      {/* Filtro de grupos musculares */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3"
      >
        <View className="flex-row gap-2">
          {MUSCULAR_GROUPS.map((group) => {
            const isSelected = group.value === selectedMuscularGroup;
            return (
              <Pressable
                key={group.label}
                onPress={() => onMuscularGroupSelect(group.value)}
                className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-500'
                    : isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <Ionicons
                  name={group.icon}
                  size={16}
                  color={isSelected ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280'}
                />
                <Text
                  className={`text-sm font-semibold ${
                    isSelected
                      ? 'text-white'
                      : isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {group.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Selector de ejercicio específico */}
      <Pressable
        onPress={() => setShowExerciseModal(true)}
        className={`p-4 rounded-xl border flex-row items-center justify-between ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <View className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <Ionicons
              name="barbell"
              size={20}
              color={isDark ? '#60A5FA' : '#3B82F6'}
            />
          </View>
          <View className="flex-1">
            <Text className={`text-xs mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Ejercicio
            </Text>
            <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedExercise?.exercise_name || 'Todos'}
            </Text>
            {selectedExercise && (
              <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {selectedExercise.muscular_group}
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-down"
            size={20}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      </Pressable>

      {/* Modal de selección de ejercicio */}
      <SelectorModal
        visible={showExerciseModal}
        title="Seleccionar ejercicio"
        items={exerciseItems}
        selectedId={selectedExerciseId?.toString() || 'all'}
        onSelect={(item) => {
          onExerciseSelect(item.value as number | null);
          setShowExerciseModal(false);
        }}
        onClose={() => setShowExerciseModal(false)}
        searchable
        searchPlaceholder="Buscar ejercicio..."
      />
    </View>
  );
}
