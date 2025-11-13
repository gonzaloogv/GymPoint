import React from 'react';
import { View, Text, Alert } from 'react-native';
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
      <View className="px-4 pt-4 pb-[18px] gap-3">
        <View className="flex-row items-start gap-4">
          <Text
            numberOfLines={2}
            className="flex-1 text-[28px] font-extrabold"
            style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
          >
            {routine.routine_name}
          </Text>
          {(onEdit || onDelete) && (
            <View className="flex-row gap-3">
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
          <Text
            className="text-sm font-medium leading-5"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            {routine.description}
          </Text>
        ) : null}

        <View className="flex-row flex-wrap gap-2">
          <View
            className="rounded-full px-3.5 py-1.5"
            style={{
              backgroundColor: isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(79, 70, 229, 0.08)',
            }}
          >
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: isDark ? '#C7D2FE' : '#4338CA', letterSpacing: 0.8 }}
            >
              {exerciseCount} ejercicio{exerciseCount !== 1 ? 's' : ''}
            </Text>
          </View>
          {routine.objective ? (
            <View
              className="rounded-full px-3.5 py-1.5"
              style={{
                backgroundColor: isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(79, 70, 229, 0.08)',
              }}
            >
              <Text
                className="text-xs font-semibold uppercase"
                style={{ color: isDark ? '#C7D2FE' : '#4338CA', letterSpacing: 0.8 }}
              >
                {routine.objective}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {showExercisesTitle ? (
        <View className="px-4 pb-3 mt-1">
          <Text
            className="text-lg font-bold"
            style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: 0.4 }}
          >
            Ejercicios
          </Text>
          <View
            className="h-px mt-2 rounded-full"
            style={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)' }}
          />
        </View>
      ) : null}
    </>
  );
}
