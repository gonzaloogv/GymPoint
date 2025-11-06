import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { StatusPill, MetaChip } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { Routine } from '../../../domain/entities';

type Props = {
  routine: Routine;
  onPress?: (routine: Routine) => void;
  onPressDetail?: (routine: Routine) => void;
  onPressStart?: (routine: Routine) => void;
};

function minutesToLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
}

export function RoutineCard({ routine, onPress, onPressDetail, onPressStart }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
      heading: isDark ? '#F9FAFB' : '#111827',
      meta: isDark ? '#9CA3AF' : '#6B7280',
      divider: isDark ? 'rgba(55, 65, 81, 0.9)' : '#E5E7EB',
      outlineBg: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.16)',
      outlineBorder: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.28)',
      outlineText: isDark ? '#C7D2FE' : '#4338CA',
      primaryBg: isDark ? '#4C51BF' : '#4338CA',
    }),
    [isDark],
  );

  const exercises = routine.exercises || [];
  const exerciseCount = exercises.length;
  const muscleGroups = Array.from(new Set(exercises.map((ex) => ex.muscular_group).filter(Boolean)));
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.series || 3), 0);
  const estimatedDuration = totalSets * 3;

  const status: 'Active' | 'Scheduled' | 'Completed' = 'Active';
  const difficulty = 'Intermedio';

  const handlePress = () => {
    if (onPress) {
      onPress(routine);
      return;
    }
    onPressDetail?.(routine);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.72}
      style={[
        styles.card,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        isDark ? styles.darkShadow : styles.lightShadow,
      ]}
    >
      <View style={styles.header}>
        <Text numberOfLines={2} style={[styles.title, { color: palette.heading }]}>
          {routine.routine_name}
        </Text>
        <View style={styles.statusWrapper}>
          <StatusPill status={status} />
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: palette.meta }]}>{minutesToLabel(estimatedDuration)}</Text>
        <Text style={[styles.metaDivider, { color: palette.meta }]}>-</Text>
        <Text style={[styles.metaText, { color: palette.meta }]}>{difficulty}</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: palette.divider }]} />

      <Text numberOfLines={2} style={[styles.description, { color: palette.meta }]}>
        {exerciseCount} ejercicios -{' '}
        {exercises
          .slice(0, 3)
          .map((exercise) => exercise.exercise_name)
          .join(', ')}
        {exerciseCount > 3 ? '...' : ''}
      </Text>

      <View style={styles.chipRow}>
        {muscleGroups.slice(0, 4).map((group) => (
          <View key={group} style={styles.chipWrapper}>
            <MetaChip>{group}</MetaChip>
          </View>
        ))}
      </View>

      <View style={[styles.buttonRow, { borderTopColor: palette.divider }]}>
        <TouchableOpacity
          onPress={() => onPressDetail?.(routine)}
          activeOpacity={0.7}
          style={[
            styles.outlineButton,
            {
              backgroundColor: palette.outlineBg,
              borderColor: palette.outlineBorder,
            },
          ]}
        >
          <Text style={[styles.outlineText, { color: palette.outlineText }]}>Detalle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onPressStart?.(routine)}
          activeOpacity={0.78}
          style={[styles.primaryButton, { backgroundColor: palette.primaryBg }]}
        >
          <Text style={styles.primaryText}>Empezar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  lightShadow: {
    shadowColor: '#4338CA',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 22,
    elevation: 6,
  },
  darkShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 26,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusWrapper: {
    marginLeft: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  metaDivider: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    marginTop: 18,
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  chipWrapper: {
    marginRight: 8,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 12,
  },
  outlineText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
