import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, MetaChip, Button } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { PredesignedRoutine } from '@features/routines/domain/entities/PredesignedRoutine';

type Props = {
  routine: PredesignedRoutine;
  onImport: (routine: PredesignedRoutine) => void;
};

const getDifficultyTone = (difficulty: string) => {
  switch (difficulty) {
    case 'Principiante':
      return { label: 'Principiante', color: '#10B981' };
    case 'Intermedio':
      return { label: 'Intermedio', color: '#F59E0B' };
    default:
      return { label: difficulty || 'Avanzado', color: '#EF4444' };
  }
};

export function ImportRoutineCard({ routine, onImport }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.65)' : '#E5E7EB',
      title: isDark ? '#F9FAFB' : '#111827',
      meta: isDark ? '#9CA3AF' : '#6B7280',
      iconBg: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(79, 70, 229, 0.12)',
      iconBorder: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
      iconColor: isDark ? '#C7D2FE' : '#4338CA',
    }),
    [isDark],
  );

  const difficultyTone = getDifficultyTone(routine.difficulty);

  const durationLabel =
    routine.duration >= 60
      ? `${Math.floor(routine.duration / 60)}h ${(routine.duration % 60)
          .toString()
          .padStart(2, '0')}m`
      : `${routine.duration} min`;

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
      <View style={styles.body}>
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: palette.iconBg,
              borderColor: palette.iconBorder,
            },
          ]}
        >
          <Ionicons name="barbell" size={22} color={palette.iconColor} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: palette.title }]} numberOfLines={2}>
              {routine.name}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.difficulty, { color: difficultyTone.color }]}>
              {difficultyTone.label}
            </Text>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={palette.meta} />
              <Text style={[styles.metaText, { color: palette.meta }]}>{durationLabel}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={14} color={palette.meta} />
              <Text style={[styles.metaText, { color: palette.meta }]}>
                {routine.exerciseCount} ejercicios
              </Text>
            </View>
          </View>

          <View style={styles.chipRow}>
            {routine.muscleGroups.slice(0, 6).map((group) => (
              <View key={group} style={styles.chipWrapper}>
                <MetaChip>{group}</MetaChip>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.ctaWrapper}>
          <Button size="sm" onPress={() => onImport(routine)}>
            Importar
          </Button>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    marginBottom: 16,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  difficulty: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipWrapper: {
    marginRight: 6,
    marginBottom: 6,
  },
  ctaWrapper: {
    marginLeft: 16,
  },
});
