import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Card } from '@shared/components/ui';
import { RoutineExercise } from '@features/routines/domain/entities/Routine';

type Props = {
  exercise: RoutineExercise;
  isExpanded: boolean;
  onToggle: () => void;
};

/**
 * Card expandible para mostrar detalles de un ejercicio en RoutineDetailScreen
 * Patrón consistente con otras pantallas de listado
 * Header siempre visible: nombre + series/reps
 * Detalles expandibles: peso, tiempo de descanso, grupos musculares
 */
export function ExpandableExerciseDetail({
  exercise,
  isExpanded,
  onToggle,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores dinámicos
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const backgroundColor = isDark ? '#1f2937' : '#ffffff';

  // Valores por defecto para campos opcionales
  const series = exercise.series ?? 3;
  const reps = exercise.reps ?? 10;

  return (
    <View className="mx-4 mb-3">
      <Card>
        {/* Header - Siempre visible */}
        <TouchableOpacity
          onPress={onToggle}
          activeOpacity={0.6}
        >
          <View className="p-4 flex-row items-center justify-between">
            {/* Nombre y metadata */}
            <View className="flex-1">
              <Text
                className="font-bold text-lg mb-2"
                style={{ color: textColor }}
              >
                {exercise.exercise_name}
              </Text>

              {/* Stats inline */}
              <View className="flex-row items-center gap-2">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: '#3b82f6' }}
                >
                  {series} × {reps} reps
                </Text>
              </View>
            </View>

            {/* Chevron */}
            <View className="ml-3">
              <Text
                className="text-2xl font-bold"
                style={{ color: '#3b82f6' }}
              >
                {isExpanded ? '▼' : '▶'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Contenido expandible - Detalles adicionales */}
        {isExpanded && (
          <View
            className="px-4 pb-4 border-t pt-4"
            style={{ borderTopColor: borderColor }}
          >
            {/* Fila: Grupo muscular */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">💪</Text>
                <Text
                  className="text-sm font-medium"
                  style={{ color: secondaryTextColor }}
                >
                  Grupo muscular
                </Text>
              </View>
              <Text
                className="text-sm font-semibold"
                style={{ color: textColor }}
              >
                {exercise.muscular_group || 'No especificado'}
              </Text>
            </View>

            {/* Fila: Descripción (si existe) */}
            {exercise.description && (
              <View className="mb-3">
                <Text
                  className="text-sm font-medium mb-1"
                  style={{ color: secondaryTextColor }}
                >
                  Descripción
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: textColor }}
                >
                  {exercise.description}
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>
    </View>
  );
}
