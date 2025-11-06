import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { StepScrollContainer, StepSection } from '@shared/components/ui';

type BasicInfo = {
  name: string;
  objective: string;
  muscleGroups: string[];
};

type ExerciseForm = {
  id_exercise: number;
  name: string;
  series: number;
  reps: number;
};

type Props = {
  basicInfo: BasicInfo;
  exercises: ExerciseForm[];
};

export function ReviewStep({ basicInfo, exercises }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      card: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
      label: isDark ? '#F9FAFB' : '#111827',
      helper: isDark ? '#9CA3AF' : '#6B7280',
      tagBg: isDark ? 'rgba(79, 70, 229, 0.12)' : 'rgba(79, 70, 229, 0.08)',
      tagText: isDark ? '#C7D2FE' : '#4338CA',
      rowBg: isDark ? '#0F172A' : '#F3F4F6',
    }),
    [isDark],
  );

  return (
    <StepScrollContainer>
      <StepSection>
        <Text style={[styles.sectionTitle, { color: palette.label }]}>Informacion general</Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: palette.helper }]}>Nombre</Text>
            <Text style={[styles.summaryValue, { color: palette.label }]}>
              {basicInfo.name || 'Sin nombre'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: palette.helper }]}>Objetivo</Text>
            <Text style={[styles.summaryValue, { color: palette.label }]}>
              {basicInfo.objective || 'No definido'}
            </Text>
          </View>

          <Text style={[styles.summaryLabel, { color: palette.helper }]}>Grupos musculares</Text>
          <View style={styles.tagRow}>
            {basicInfo.muscleGroups.length > 0 ? (
              basicInfo.muscleGroups.map((group) => (
                <View
                  key={group}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: palette.tagBg,
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: palette.tagText }]}>{group}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.summaryValue, { color: palette.label }]}>No seleccionados</Text>
            )}
          </View>
        </View>
      </StepSection>

      <StepSection>
        <Text style={[styles.sectionTitle, { color: palette.label }]}>
          Ejercicios ({exercises.length})
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          {exercises.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={[styles.emptyText, { color: palette.helper }]}>
                Todavia no agregaste ejercicios.
              </Text>
            </View>
          ) : (
            exercises.map((exercise, index) => (
              <View
                key={exercise.id_exercise}
                style={[
                  styles.exerciseRow,
                  {
                    backgroundColor: palette.rowBg,
                  },
                ]}
              >
                <Text style={[styles.exerciseTitle, { color: palette.label }]}>
                  {index + 1}. {exercise.name || 'Sin nombre'}
                </Text>
                <Text style={[styles.exerciseMeta, { color: palette.helper }]}>
                  {exercise.series} series - {exercise.reps} repeticiones
                </Text>
              </View>
            ))
          )}
        </View>
      </StepSection>
    </StepScrollContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  emptyBlock: {
    paddingVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  exerciseRow: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 6,
  },
  exerciseTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
});

