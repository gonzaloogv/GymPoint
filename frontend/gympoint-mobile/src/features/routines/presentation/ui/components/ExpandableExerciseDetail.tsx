import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Card } from '@shared/components/ui';
import { RoutineExercise } from '@features/routines/domain/entities/Routine';

type Props = {
  exercise: RoutineExercise;
  isExpanded: boolean;
  onToggle: () => void;
};

export function ExpandableExerciseDetail({ exercise, isExpanded, onToggle }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
      title: isDark ? '#F9FAFB' : '#111827',
      subtitle: isDark ? '#9CA3AF' : '#6B7280',
      pillBg: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.16)',
      pillText: isDark ? '#C7D2FE' : '#4338CA',
      divider: isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(148, 163, 184, 0.35)',
    }),
    [isDark],
  );

  const series = exercise.series ?? 3;
  const reps = exercise.reps ?? 10;

  return (
    <Card
      padding="none"
      style={[
        styles.card,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
      ]}
    >
      <TouchableOpacity onPress={onToggle} activeOpacity={0.75} style={styles.header}>
        <View style={styles.titleStack}>
          <Text style={[styles.title, { color: palette.title }]} numberOfLines={1}>
            {exercise.exercise_name}
          </Text>
          <View style={[styles.metaPill, { backgroundColor: palette.pillBg }]}>
            <Text style={[styles.metaText, { color: palette.pillText }]}>
              {series} x {reps} reps
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={palette.subtitle}
        />
      </TouchableOpacity>

      {isExpanded ? (
        <View style={[styles.body, { borderTopColor: palette.divider }]}>
          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Ionicons name="barbell-outline" size={18} color={palette.subtitle} />
              <Text style={[styles.rowLabelText, { color: palette.subtitle }]}>Grupo muscular</Text>
            </View>
            <Text style={[styles.rowValue, { color: palette.title }]}>
              {exercise.muscular_group || 'No especificado'}
            </Text>
          </View>

          {exercise.description ? (
            <View style={styles.descriptionBlock}>
              <Text style={[styles.rowLabelText, { color: palette.subtitle }]}>Descripcion</Text>
              <Text style={[styles.descriptionText, { color: palette.title }]}>
                {exercise.description}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  titleStack: {
    flex: 1,
    paddingRight: 12,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  metaPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabelText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionBlock: {
    gap: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

