import React, { useMemo } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button, ButtonText } from '@shared/components/ui';
import type { Routine } from '@features/routines/domain/entities';

type Props = {
  routine: Routine;
  showExercisesTitle?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function RoutineDetailHeader({
  routine,
  showExercisesTitle = true,
  onEdit,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      title: isDark ? '#F9FAFB' : '#111827',
      subtitle: isDark ? '#9CA3AF' : '#6B7280',
      tagBg: isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(79, 70, 229, 0.08)',
      tagText: isDark ? '#C7D2FE' : '#4338CA',
      divider: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)',
    }),
    [isDark],
  );

  const exerciseCount = routine.exercises?.length || 0;

  const handleDelete = () => {
    if (!onDelete) {
      return;
    }

    Alert.alert(
      'Eliminar rutina',
      `¿Eliminar "${routine.routine_name}"? No podrás deshacer esta acción.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: onDelete,
        },
      ],
    );
  };

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.title }]} numberOfLines={2}>
            {routine.routine_name}
          </Text>
          {(onEdit || onDelete) && (
            <View style={styles.actions}>
              {onEdit ? (
                <Button variant="secondary" size="sm" onPress={onEdit}>
                  <ButtonText>Editar</ButtonText>
                </Button>
              ) : null}
              {onDelete ? (
                <Button variant="danger" size="sm" onPress={handleDelete}>
                  <ButtonText>Eliminar</ButtonText>
                </Button>
              ) : null}
            </View>
          )}
        </View>

        {routine.description ? (
          <Text style={[styles.description, { color: palette.subtitle }]}>
            {routine.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <View
            style={[
              styles.metaPill,
              {
                backgroundColor: palette.tagBg,
              },
            ]}
          >
            <Text style={[styles.metaText, { color: palette.tagText }]}>
              {exerciseCount} ejercicio{exerciseCount !== 1 ? 's' : ''}
            </Text>
          </View>
          {routine.objective ? (
            <View
              style={[
                styles.metaPill,
                {
                  backgroundColor: palette.tagBg,
                },
              ]}
            >
              <Text style={[styles.metaText, { color: palette.tagText }]}>{routine.objective}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {showExercisesTitle ? (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.title }]}>Ejercicios</Text>
          <View style={[styles.sectionDivider, { backgroundColor: palette.divider }]} />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  sectionDivider: {
    height: 1,
    marginTop: 8,
    borderRadius: 999,
  },
});
