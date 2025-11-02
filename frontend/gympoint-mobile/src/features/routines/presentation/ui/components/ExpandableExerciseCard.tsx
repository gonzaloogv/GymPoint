import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Card } from '@shared/components/ui';
import { Exercise } from '@features/routines/domain/entities/Exercise';
import { SetExecution, TimerState } from '@features/routines/domain/entities/ExecutionSession';
import { ExerciseSetTable } from './ExerciseSetTable';
import { RestTimer } from './RestTimer';

type Props = {
  exercise: Exercise;
  isExpanded: boolean;
  onToggleExpand: () => void;
  sets: SetExecution[];
  onUpdateSet: (setIndex: number, data: Partial<SetExecution>) => void;
  onAddSet: () => void;
  onMarkSetDone: (setIndex: number) => void;
  restTimerState?: TimerState;
  onSkipTimer?: () => void;
  onTimerComplete?: () => void;
};

/**
 * Card expandible para un ejercicio durante la ejecución
 * Muestra nombre siempre visible, expande para mostrar tabla de series
 */
export function ExpandableExerciseCard({
  exercise,
  isExpanded,
  onToggleExpand,
  sets,
  onUpdateSet,
  onAddSet,
  onMarkSetDone,
  restTimerState,
  onSkipTimer,
  onTimerComplete,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores dinámicos
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  // Contar sets completados
  const completedSets = sets.filter((s) => s.isDone).length;
  const totalSets = sets.length;

  // Calcular volumen del ejercicio
  const exerciseVolume = sets.reduce((sum, s) => {
    if (s.isDone) {
      return sum + s.currentWeight * s.currentReps;
    }
    return sum;
  }, 0);

  return (
    <View className="mx-4 mb-3">
      <Card>
        {/* Header - Siempre visible */}
        <TouchableOpacity
          onPress={onToggleExpand}
          activeOpacity={0.6}
        >
          <View className="p-4 flex-row items-center justify-between">
            {/* Nombre y metadata */}
            <View className="flex-1">
              <Text
                className="font-bold text-base mb-1"
                style={{ color: textColor }}
              >
                {exercise.name}
              </Text>

              {/* Stats inline */}
              <View className="flex-row gap-2">
                {totalSets > 0 && (
                  <Text
                    className="text-xs"
                    style={{ color: secondaryTextColor }}
                  >
                    {completedSets}/{totalSets} series
                  </Text>
                )}

                {exerciseVolume > 0 && (
                  <>
                    <Text style={{ color: secondaryTextColor }}>•</Text>
                    <Text
                      className="text-xs"
                      style={{ color: secondaryTextColor }}
                    >
                      {exerciseVolume.toFixed(0)} kg
                    </Text>
                  </>
                )}

                {/* Rest time */}
                {exercise.rest > 0 && (
                  <>
                    <Text style={{ color: secondaryTextColor }}>•</Text>
                    <Text
                      className="text-xs"
                      style={{ color: secondaryTextColor }}
                    >
                      Descanso: {exercise.rest}s
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Chevron */}
            <View className="ml-2">
              <Text
                className="text-2xl"
                style={{ color: secondaryTextColor }}
              >
                {isExpanded ? '▼' : '▶'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Contenido expandible */}
        {isExpanded && (
          <View
            className="px-4 pb-4 border-t pt-4"
            style={{ borderTopColor: borderColor }}
          >
            {/* Timer si está activo para este ejercicio */}
            {restTimerState && (
              <>
                <RestTimer
                  state={restTimerState}
                  onTimerComplete={onTimerComplete}
                  onSkip={onSkipTimer}
                />
                <View className="h-4" />
              </>
            )}

            {/* Tabla de series */}
            <ExerciseSetTable
              sets={sets}
              onUpdateSet={onUpdateSet}
              onAddSet={onAddSet}
              onMarkSetDone={onMarkSetDone}
            />
          </View>
        )}
      </Card>
    </View>
  );
}
