import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Card } from '@shared/components/ui';
import { Exercise } from '@features/routines/domain/entities/Exercise';
import { SetExecution } from '@features/routines/domain/entities/ExecutionSession';
import { ExerciseSetTable } from './ExerciseSetTable';

type Props = {
  exercise: Exercise;
  isExpanded: boolean;
  onToggleExpand: () => void;
  sets: SetExecution[];
  onUpdateSet: (setIndex: number, data: Partial<SetExecution>) => void;
  onAddSet: () => void;
  onMarkSetDone: (setIndex: number) => void;
};

export function ExpandableExerciseCard({
  exercise,
  isExpanded,
  onToggleExpand,
  sets,
  onUpdateSet,
  onAddSet,
  onMarkSetDone,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
      title: isDark ? '#F9FAFB' : '#111827',
      subtitle: isDark ? '#9CA3AF' : '#6B7280',
      tagBg: isDark ? 'rgba(129, 140, 248, 0.18)' : 'rgba(79, 70, 229, 0.12)',
      tagText: isDark ? '#C7D2FE' : '#4338CA',
      divider: isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(148, 163, 184, 0.3)',
      chevron: isDark ? '#9CA3AF' : '#6B7280',
    }),
    [isDark],
  );

  const completedSets = sets.filter((s) => s.isDone).length;
  const totalSets = sets.length;
  const exerciseVolume = sets.reduce((sum, set) => {
    if (set.isDone) {
      return sum + set.currentWeight * set.currentReps;
    }
    return sum;
  }, 0);

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
      <TouchableOpacity onPress={onToggleExpand} activeOpacity={0.75}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: palette.title }]} numberOfLines={1}>
              {exercise.name}
            </Text>
            <View style={styles.metaRow}>
              {totalSets > 0 ? (
                <View style={[styles.metaPill, { backgroundColor: palette.tagBg }]}>
                  <Text style={[styles.metaText, { color: palette.tagText }]}>
                    {completedSets}/{totalSets} series
                  </Text>
                </View>
              ) : null}
              {exerciseVolume > 0 ? (
                <View style={[styles.metaPill, { backgroundColor: palette.tagBg }]}>
                  <Text style={[styles.metaText, { color: palette.tagText }]}>
                    {exerciseVolume.toFixed(0)} kg
                  </Text>
                </View>
              ) : null}
              {exercise.rest > 0 ? (
                <View style={[styles.metaPill, { backgroundColor: palette.tagBg }]}>
                  <Text style={[styles.metaText, { color: palette.tagText }]}>
                    Descanso {exercise.rest}s
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={palette.chevron}
          />
        </View>
      </TouchableOpacity>

      {isExpanded ? (
        <View
          style={[
            styles.body,
            {
              borderTopColor: palette.divider,
            },
          ]}
        >
          <ExerciseSetTable
            sets={sets}
            onUpdateSet={onUpdateSet}
            onAddSet={onAddSet}
            onMarkSetDone={onMarkSetDone}
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
});
