import { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Feather } from '@expo/vector-icons';
import {
  StepScrollContainer,
  StepSection,
  Button,
  Input,
} from '@shared/components/ui';
import { ExerciseSelectorModal } from './ExerciseSelectorModal';
import { ExerciseDTO } from '../../../../data/remote/exercise.api';

// ExerciseForm type that matches useCreateRoutine expectations
type ExerciseForm = {
  id_exercise: number;
  name: string;
  series: number;
  reps: number;
};

type Props = {
  exercises: ExerciseForm[];
  onChange: (exercises: ExerciseForm[]) => void;
};

export function ExercisesStep({ exercises, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const [showSelector, setShowSelector] = useState(false);

  const handleSelectExercise = (exercise: ExerciseDTO) => {
    const newExercise: ExerciseForm = {
      id_exercise: exercise.id_exercise,
      name: exercise.exercise_name,
      series: 3, // default value
      reps: 10, // default numeric value
    };
    console.log('➕ Adding exercise from backend:', newExercise);
    onChange([...exercises, newExercise]);
  };

  const updateExercise = (id: number, field: keyof ExerciseForm, value: any) => {
    const updated = exercises.map((ex) =>
      ex.id_exercise === id ? { ...ex, [field]: value } : ex
    );
    console.log('✏️ Updated exercises:', updated);
    onChange(updated);
  };

  const removeExercise = (id: number) => {
    console.log('🗑️ Removing exercise:', id);
    onChange(exercises.filter((ex) => ex.id_exercise !== id));
  };

  return (
    <StepScrollContainer>
      <StepSection>
        <Text className="text-sm font-semibold mb-4" style={{ color: textColor }}>
          Ejercicios de la rutina
        </Text>
        {exercises.length === 0 && (
          <Text className="text-center text-sm" style={{ color: subtextColor, marginVertical: 32, lineHeight: 20 }}>
            No hay ejercicios.{'\n'}Presiona el botón + para agregar.
          </Text>
        )}
        {exercises.map((exercise, index) => (
          <View
            key={exercise.id_exercise}
            className="rounded-lg p-5 mb-4 border"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
              borderWidth: 1,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-semibold flex-1" style={{ color: textColor }}>
                Ejercicio {index + 1}
              </Text>
              <TouchableOpacity onPress={() => removeExercise(exercise.id_exercise)} className="p-1">
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <View className="mb-3">
              <Text className="text-xs font-medium mb-1.5" style={{ color: subtextColor }}>
                Nombre
              </Text>
              <View
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 16, color: textColor }}>
                  {exercise.name}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs font-medium mb-1.5" style={{ color: subtextColor }}>
                  Series
                </Text>
                <Input
                  value={String(exercise.series)}
                  onChangeText={(v) => updateExercise(exercise.id_exercise, 'series', parseInt(v) || 0)}
                  placeholder="3"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-medium mb-1.5" style={{ color: subtextColor }}>
                  Reps
                </Text>
                <Input
                  value={String(exercise.reps)}
                  onChangeText={(v) => updateExercise(exercise.id_exercise, 'reps', parseInt(v) || 0)}
                  placeholder="10"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}
      </StepSection>
      <Button onPress={() => setShowSelector(true)} variant="primary" className="flex-row items-center gap-2 mt-1">
        <Feather name="plus" size={20} color="#fff" />
        <Text className="text-white font-semibold text-sm">Seleccionar ejercicio</Text>
      </Button>

      <ExerciseSelectorModal
        visible={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={handleSelectExercise}
      />
    </StepScrollContainer>
  );
}
