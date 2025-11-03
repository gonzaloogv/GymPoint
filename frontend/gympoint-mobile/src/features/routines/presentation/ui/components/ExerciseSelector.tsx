import React, { useMemo } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Exercise } from '@features/routines/domain/entities';
import { Button, ButtonText } from '@shared/components/ui';

type ExerciseSelectorProps = {
  visible: boolean;
  allExercises: Exercise[];
  addedExerciseIds: string[];
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
};

/**
 * Modal para seleccionar ejercicios adicionales durante la ejecución
 * Muestra solo los ejercicios que aún no han sido agregados
 */
export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  visible,
  allExercises,
  addedExerciseIds,
  onSelect,
  onClose,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores dinámicos
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const backgroundColor = isDark ? '#111827' : '#f9fafb';
  const cardBgColor = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const accentColor = '#3b82f6';

  // Filtrar ejercicios no agregados
  const availableExercises = useMemo(() => {
    return allExercises.filter((ex) => !addedExerciseIds.includes(ex.id));
  }, [allExercises, addedExerciseIds]);

  const handleSelectExercise = (exerciseId: string) => {
    onSelect(exerciseId);
    onClose();
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      onPress={() => handleSelectExercise(item.id)}
      className="mb-3 p-4 rounded-lg border"
      style={{
        backgroundColor: cardBgColor,
        borderColor: borderColor,
      }}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text
            className="text-base font-bold mb-1"
            style={{ color: textColor }}
          >
            {item.name}
          </Text>
          <View className="flex-row gap-4 flex-wrap">
            <View className="flex-row items-center gap-1">
              <Text className="text-sm" style={{ color: secondaryTextColor }}>
                Sets:
              </Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: textColor }}
              >
                {item.sets}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-sm" style={{ color: secondaryTextColor }}>
                Reps:
              </Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: textColor }}
              >
                {item.reps}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-sm" style={{ color: secondaryTextColor }}>
                Rest:
              </Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: textColor }}
              >
                {item.rest}s
              </Text>
            </View>
          </View>
        </View>
      </View>
      {item.muscleGroups && item.muscleGroups.length > 0 && (
        <View className="flex-row gap-2 flex-wrap mt-3">
          {item.muscleGroups.map((group) => (
            <View
              key={group}
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor: accentColor + '20',
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: accentColor }}
              >
                {group}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        className="flex-1"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <View
          className="flex-1 rounded-t-3xl mt-20"
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b" style={{ borderBottomColor: borderColor }}>
            <Text
              className="text-xl font-bold"
              style={{ color: textColor }}
            >
              Agregar Ejercicio
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text
                className="text-2xl font-bold"
                style={{ color: secondaryTextColor }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {availableExercises.length > 0 ? (
            <FlatList
              data={availableExercises}
              renderItem={renderExerciseItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              scrollEnabled
            />
          ) : (
            <View className="flex-1 items-center justify-center px-4">
              <Text
                className="text-lg font-semibold text-center"
                style={{ color: secondaryTextColor }}
              >
                Todos los ejercicios ya han sido agregados
              </Text>
            </View>
          )}

          {/* Footer Button */}
          <View className="absolute bottom-0 left-0 right-0 px-4 py-4" style={{ backgroundColor: backgroundColor }}>
            <Button onPress={onClose} className="w-full">
              <ButtonText>Cancelar</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
