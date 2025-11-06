import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, SetPill } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

type Exercise = {
  id: string;
  name: string;
  sets: number | string;
  reps: string;
  rest: number;
  muscleGroups: string[];
};

type Props = {
  exercise: Exercise;
  totalSets: number;
  currentSet: number;
  restSeconds: number;
};

export function ExerciseCard({ exercise, totalSets, currentSet, restSeconds }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#11171f' : '#ffffff',
      title: isDark ? '#F9FAFB' : '#111827',
      meta: isDark ? '#9CA3AF' : '#6B7280',
      badge: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.15)',
      badgeText: isDark ? '#C7D2FE' : '#4338CA',
    }),
    [isDark],
  );

  const infoLine = `Series: ${totalSets} · Reps objetivo: ${exercise.reps} · Descanso: ${exercise.rest}s`;

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: palette.background,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: palette.title }]}>{exercise.name}</Text>
        <Text style={[styles.meta, { color: palette.meta }]}>{infoLine}</Text>

        <View style={styles.setRow}>
          {Array.from({ length: totalSets }).map((_, index) => {
            const setNumber = index + 1;
            const done = setNumber < currentSet;
            const isCurrent = setNumber === currentSet;
            return (
              <View key={setNumber} style={styles.setPill}>
                <SetPill setNumber={setNumber} done={done} current={isCurrent} />
              </View>
            );
          })}
        </View>

        {restSeconds > 0 ? (
          <Text style={[styles.meta, { color: palette.meta }]}>Descanso restante: {restSeconds}s</Text>
        ) : null}

        {exercise.muscleGroups?.length ? (
          <View style={styles.tags}>
            {exercise.muscleGroups.slice(0, 4).map((group) => (
              <View key={group} style={[styles.tag, { backgroundColor: palette.badge }]}>
                <Text style={[styles.tagText, { color: palette.badgeText }]}>{group}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  setRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setPill: {
    marginRight: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
