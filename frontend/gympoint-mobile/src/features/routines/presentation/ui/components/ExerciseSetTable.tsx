import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { SetExecution } from '@features/routines/domain/entities/ExecutionSession';
import { EditableSetRow } from './EditableSetRow';

type Props = {
  sets: SetExecution[];
  onUpdateSet: (setIndex: number, data: Partial<SetExecution>) => void;
  onAddSet: () => void;
  onMarkSetDone: (setIndex: number) => void;
};

export function ExerciseSetTable({
  sets,
  onUpdateSet,
  onAddSet,
  onMarkSetDone,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      headerBg: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(248, 250, 252, 0.9)',
      headerText: isDark ? '#9CA3AF' : '#6B7280',
      divider: isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(148, 163, 184, 0.35)',
      accent: isDark ? '#6366F1' : '#4F46E5',
    }),
    [isDark],
  );

  return (
    <View style={[styles.wrapper, { borderColor: palette.divider }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: palette.headerBg,
            borderBottomColor: palette.divider,
          },
        ]}
      >
        <Text style={[styles.headerCell, styles.seriesHeader, { color: palette.headerText }]}>
          Serie
        </Text>
        <Text style={[styles.headerCell, styles.previousHeader, { color: palette.headerText }]}>
          Anterior
        </Text>
        <Text style={[styles.headerCell, styles.inputHeader, { color: palette.headerText }]}>
          Kg
        </Text>
        <Text style={[styles.headerCell, styles.inputHeader, { color: palette.headerText }]}>
          Reps
        </Text>
        <Text style={[styles.headerToggle, { color: palette.headerText }]}>
          Hecha
        </Text>
      </View>

      {sets.length ? (
        sets.map((set, index) => (
          <EditableSetRow
            key={`set-${set.setNumber}`}
            set={set}
            onUpdate={(data) => onUpdateSet(index, data)}
            onMarkDone={() => onMarkSetDone(index)}
            borderColor={palette.divider}
          />
        ))
      ) : (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={20} color={palette.headerText} />
          <Text style={[styles.emptyText, { color: palette.headerText }]}>
            No hay series agregadas
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.addButton, { borderTopColor: palette.divider }]}
        onPress={onAddSet}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle" size={18} color={palette.accent} />
        <Text style={[styles.addLabel, { color: palette.accent }]}>Agregar serie</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 16,
  },
  seriesHeader: {
    width: 52,
  },
  previousHeader: {
    flex: 1.25,
    paddingHorizontal: 4,
  },
  inputHeader: {
    flex: 1,
  },
  headerToggle: {
    width: 68,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  empty: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.25)',
  },
  addLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
