import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { StepScrollContainer, StepSection, Button, Input } from '@shared/components/ui';
import { ExerciseSelectorModal } from './ExerciseSelectorModal';
import { ExerciseDTO } from '../../../../data/remote/exercise.api';

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
  const [showSelector, setShowSelector] = useState(false);

  const card = isDark ? '#111827' : '#ffffff';
  const border = isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB';
  const label = isDark ? '#F9FAFB' : '#111827';
  const helper = isDark ? '#9CA3AF' : '#6B7280';
  const muted = isDark ? '#374151' : '#F3F4F6';
  const deleteColor = '#EF4444';

  const handleSelectExercise = (exercise: ExerciseDTO) => {
    const form: ExerciseForm = {
      id_exercise: exercise.id_exercise,
      name: exercise.exercise_name,
      series: 3,
      reps: 10,
    };
    onChange([...exercises, form]);
  };

  const updateExercise = (id: number, field: keyof ExerciseForm, value: number) => {
    const updated = exercises.map((item) =>
      item.id_exercise === id ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  };

  const removeExercise = (id: number) => {
    onChange(exercises.filter((item) => item.id_exercise !== id));
  };

  return (
    <StepScrollContainer>
      <StepSection>
        <Text className="text-base font-bold mb-3" style={{ color: label }}>
          Ejercicios de la rutina
        </Text>
        {exercises.length === 0 ? (
          <Text
            className="text-center text-[13px] mb-6 leading-[18px]"
            style={{ color: helper }}
          >
            No hay ejercicios agregados. Usa el boton para sumar tu primer ejercicio.
          </Text>
        ) : null}

        {exercises.map((exercise, index) => (
          <View
            key={exercise.id_exercise}
            className="border rounded-[20px] px-[18px] py-5 mb-4 gap-4"
            style={{ backgroundColor: card, borderColor: border }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px] font-bold" style={{ color: label }}>
                Ejercicio {index + 1}
              </Text>
              <TouchableOpacity
                onPress={() => removeExercise(exercise.id_exercise)}
                activeOpacity={0.72}
                className="p-1 rounded-xl"
              >
                <Feather name="trash-2" size={18} color={deleteColor} />
              </TouchableOpacity>
            </View>

            <View className="gap-2">
              <Text
                className="text-xs font-semibold uppercase"
                style={{ color: helper, letterSpacing: 0.3 }}
              >
                Nombre
              </Text>
              <View
                className="rounded-[14px] px-4 py-3 justify-center"
                style={{ backgroundColor: muted }}
              >
                <Text
                  numberOfLines={1}
                  className="text-base font-semibold"
                  style={{ color: label }}
                >
                  {exercise.name}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3.5">
              <View className="flex-1 gap-2">
                <Text
                  className="text-xs font-semibold uppercase"
                  style={{ color: helper, letterSpacing: 0.3 }}
                >
                  Series
                </Text>
                <Input
                  value={String(exercise.series)}
                  onChangeText={(value) =>
                    updateExercise(exercise.id_exercise, 'series', Number(value) || 0)
                  }
                  placeholder="3"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 gap-2">
                <Text
                  className="text-xs font-semibold uppercase"
                  style={{ color: helper, letterSpacing: 0.3 }}
                >
                  Repeticiones
                </Text>
                <Input
                  value={String(exercise.reps)}
                  onChangeText={(value) =>
                    updateExercise(exercise.id_exercise, 'reps', Number(value) || 0)
                  }
                  placeholder="10"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}
      </StepSection>

      <Button
        variant="primary"
        icon={<Feather name="plus" size={18} color="#FFFFFF" />}
        onPress={() => setShowSelector(true)}
        fullWidth
      >
        Agregar ejercicio
      </Button>

      <ExerciseSelectorModal
        visible={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={handleSelectExercise}
      />
    </StepScrollContainer>
  );
}
