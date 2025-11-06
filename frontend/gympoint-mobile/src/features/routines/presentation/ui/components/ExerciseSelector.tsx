import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Exercise } from '@features/routines/domain/entities';
import { Button, ButtonText, Card } from '@shared/components/ui';

type ExerciseSelectorProps = {
  visible: boolean;
  allExercises: Exercise[];
  addedExerciseIds: string[];
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
};

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  visible,
  allExercises,
  addedExerciseIds,
  onSelect,
  onClose,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      backdrop: 'rgba(15, 23, 42, 0.55)',
      surface: isDark ? '#0F172A' : '#f8fafc',
      headerText: isDark ? '#F9FAFB' : '#111827',
      subtitle: isDark ? '#9CA3AF' : '#6B7280',
      badgeBg: isDark ? 'rgba(129, 140, 248, 0.18)' : 'rgba(79, 70, 229, 0.14)',
      badgeText: isDark ? '#C7D2FE' : '#4338CA',
      divider: isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(148, 163, 184, 0.3)',
    }),
    [isDark],
  );

  const availableExercises = useMemo(
    () => allExercises.filter((exercise) => !addedExerciseIds.includes(exercise.id)),
    [allExercises, addedExerciseIds],
  );

  const handleSelectExercise = (exerciseId: string) => {
    onSelect(exerciseId);
    onClose();
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <Card style={styles.card}>
      <TouchableOpacity onPress={() => handleSelectExercise(item.id)} activeOpacity={0.75}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: palette.headerText }]}>{item.name}</Text>
            <Ionicons name="add-circle" size={20} color={palette.badgeText} />
          </View>
          <Text style={[styles.cardSubtitle, { color: palette.subtitle }]}>
            {`Sets: ${item.sets} · Reps: ${item.reps} · Descanso: ${item.rest}s`}
          </Text>

          {item.muscleGroups?.length ? (
            <View style={styles.tagRow}>
              {item.muscleGroups.slice(0, 4).map((group) => (
                <View key={group} style={[styles.tag, { backgroundColor: palette.badgeBg }]}>
                  <Text style={[styles.tagText, { color: palette.badgeText }]}>{group}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: palette.backdrop }]}>
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={[styles.sheetHeader, { borderBottomColor: palette.divider }]}>
            <Text style={[styles.sheetTitle, { color: palette.headerText }]}>Agregar ejercicio</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={palette.subtitle} />
            </TouchableOpacity>
          </View>

          {availableExercises.length ? (
            <FlatList
              data={availableExercises}
              renderItem={renderExerciseItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle" size={24} color={palette.badgeText} />
              <Text style={[styles.emptyText, { color: palette.subtitle }]}>
                Todos los ejercicios ya fueron agregados
              </Text>
            </View>
          )}

          <View style={[styles.footer, { borderTopColor: palette.divider }]}>
            <Button onPress={onClose} variant="secondary" fullWidth>
              <ButtonText>Cancelar</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    flex: 1,
    marginTop: 48,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.28)',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagRow: {
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
