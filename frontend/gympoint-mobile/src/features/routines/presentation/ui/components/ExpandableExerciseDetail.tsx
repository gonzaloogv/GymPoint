import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Card } from '@shared/components/ui';
import { Exercise } from '@features/routines/domain/entities/Exercise';

type Props = {
  exercise: Exercise;
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

  // Determinar grupos musculares a mostrar
  const muscleGroups = exercise.muscleGroups || [];
  const mainMuscleGroup = muscleGroups.length > 0 ? muscleGroups[0] : 'General';

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
                {exercise.name}
              </Text>

              {/* Stats inline */}
              <View className="flex-row items-center gap-2">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: '#3b82f6' }}
                >
                  {exercise.sets} × {exercise.reps} reps
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
            {/* Fila: Descanso */}
            {exercise.rest > 0 && (
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg">⏱️</Text>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: secondaryTextColor }}
                  >
                    Tiempo de descanso
                  </Text>
                </View>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: textColor }}
                >
                  {exercise.rest} segundos
                </Text>
              </View>
            )}

            {/* Fila: Grupo muscular principal */}
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
                {mainMuscleGroup}
              </Text>
            </View>

            {/* Fila: Todos los grupos musculares (si hay múltiples) */}
            {muscleGroups.length > 1 && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg">🦵</Text>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: secondaryTextColor }}
                  >
                    Otros músculos
                  </Text>
                </View>
                <View className="flex-1 ml-2">
                  <Text
                    className="text-sm text-right"
                    style={{ color: textColor }}
                    numberOfLines={2}
                  >
                    {muscleGroups.slice(1).join(', ')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </Card>
    </View>
  );
}
