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

  const backdrop = 'rgba(15, 23, 42, 0.55)';
  const surface = isDark ? '#0F172A' : '#f8fafc';
  const headerText = isDark ? '#F9FAFB' : '#111827';
  const subtitle = isDark ? '#9CA3AF' : '#6B7280';
  const badgeBg = isDark ? 'rgba(129, 140, 248, 0.18)' : 'rgba(79, 70, 229, 0.14)';
  const badgeText = isDark ? '#C7D2FE' : '#4338CA';
  const divider = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(148, 163, 184, 0.3)';

  const availableExercises = useMemo(
    () => allExercises.filter((exercise) => !addedExerciseIds.includes(exercise.id)),
    [allExercises, addedExerciseIds],
  );

  const handleSelectExercise = (exerciseId: string) => {
    onSelect(exerciseId);
    onClose();
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <Card className="border" style={{ borderColor: 'rgba(148, 163, 184, 0.28)' }}>
      <TouchableOpacity onPress={() => handleSelectExercise(item.id)} activeOpacity={0.75}>
        <View className="px-4 py-4 gap-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold" style={{ color: headerText }}>
              {item.name}
            </Text>
            <Ionicons name="add-circle" size={20} color={badgeText} />
          </View>
          <Text className="text-[13px] font-medium" style={{ color: subtitle }}>
            {`Sets: ${item.sets} · Reps: ${item.reps} · Descanso: ${item.rest}s`}
          </Text>

          {item.muscleGroups?.length ? (
            <View className="flex-row flex-wrap gap-2">
              {item.muscleGroups.slice(0, 4).map((group) => (
                <View
                  key={group}
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: badgeBg }}
                >
                  <Text
                    className="text-[11px] font-semibold uppercase"
                    style={{ color: badgeText, letterSpacing: 0.6 }}
                  >
                    {group}
                  </Text>
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
      <View className="flex-1 justify-end" style={{ backgroundColor: backdrop }}>
        <View
          className="flex-1 mt-12 rounded-t-[28px] overflow-hidden"
          style={{ backgroundColor: surface }}
        >
          <View
            className="flex-row items-center justify-between px-5 py-[18px] border-b"
            style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: divider }}
          >
            <Text className="text-xl font-bold" style={{ color: headerText }}>
              Agregar ejercicio
            </Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={subtitle} />
            </TouchableOpacity>
          </View>

          {availableExercises.length ? (
            <FlatList
              data={availableExercises}
              renderItem={renderExerciseItem}
              keyExtractor={(item) => item.id}
              contentContainerClassName="px-4 py-4 pb-[120px] gap-3"
            />
          ) : (
            <View className="flex-1 items-center justify-center gap-3">
              <Ionicons name="checkmark-done-circle" size={24} color={badgeText} />
              <Text className="text-sm font-semibold text-center px-8" style={{ color: subtitle }}>
                Todos los ejercicios ya fueron agregados
              </Text>
            </View>
          )}

          <View
            className="px-4 py-4 border-t"
            style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: divider }}
          >
            <Button onPress={onClose} variant="secondary" fullWidth>
              <ButtonText>Cancelar</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
