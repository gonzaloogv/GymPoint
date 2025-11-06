import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
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

  const palette = useMemo(
    () => ({
      card: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
      label: isDark ? '#F9FAFB' : '#111827',
      helper: isDark ? '#9CA3AF' : '#6B7280',
      muted: isDark ? '#374151' : '#F3F4F6',
      delete: '#EF4444',
    }),
    [isDark],
  );

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
        <Text style={[styles.sectionTitle, { color: palette.label }]}>Ejercicios de la rutina</Text>
        {exercises.length === 0 ? (
          <Text style={[styles.emptyHint, { color: palette.helper }]}>
            No hay ejercicios agregados. Usa el boton para sumar tu primer ejercicio.
          </Text>
        ) : null}

        {exercises.map((exercise, index) => (
          <View
            key={exercise.id_exercise}
            style={[
              styles.exerciseCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.exerciseTitle, { color: palette.label }]}>
                Ejercicio {index + 1}
              </Text>
              <TouchableOpacity
                onPress={() => removeExercise(exercise.id_exercise)}
                activeOpacity={0.72}
                style={styles.deleteButton}
              >
                <Feather name="trash-2" size={18} color={palette.delete} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: palette.helper }]}>Nombre</Text>
              <View
                style={[
                  styles.nameBox,
                  {
                    backgroundColor: palette.muted,
                  },
                ]}
              >
                <Text style={[styles.nameText, { color: palette.label }]} numberOfLines={1}>
                  {exercise.name}
                </Text>
              </View>
            </View>

            <View style={styles.inlineFields}>
              <View style={styles.inlineField}>
                <Text style={[styles.fieldLabel, { color: palette.helper }]}>Series</Text>
                <Input
                  value={String(exercise.series)}
                  onChangeText={(value) =>
                    updateExercise(exercise.id_exercise, 'series', Number(value) || 0)
                  }
                  placeholder="3"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inlineField}>
                <Text style={[styles.fieldLabel, { color: palette.helper }]}>Repeticiones</Text>
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

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyHint: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 24,
    lineHeight: 18,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginBottom: 16,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 4,
    borderRadius: 12,
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    letterSpacing: 0.3,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  nameBox: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 14,
  },
  inlineField: {
    flex: 1,
    gap: 8,
  },
});
