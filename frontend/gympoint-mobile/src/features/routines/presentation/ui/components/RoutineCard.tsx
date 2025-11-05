import { TouchableOpacity, View, Text } from 'react-native';
import { Card, StatusPill, MetaChip } from '@shared/components/ui';
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
  const metaColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#ffffff' : '#000000';
  const buttonBgColor = isDark ? '#1f2937' : '#f3f4f6';
  const primaryColor = '#3b82f6';

  // Adapt backend data to UI
  const exercises = routine.exercises || [];
  const exerciseCount = exercises.length;

  // Extract unique muscle groups from exercises
  const muscleGroups = Array.from(
    new Set(exercises.map(ex => ex.muscular_group).filter(Boolean))
  );

  // Calculate estimated duration (3 min per set average)
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.series || 3), 0);
  const estimatedDuration = totalSets * 3; // minutes

  // Mock status until backend implements it
  const status: 'Active' | 'Scheduled' | 'Completed' = 'Active';

  // Mock difficulty until backend implements it
  const difficulty = 'Intermedio';

  return (
    <TouchableOpacity
      onPress={() => onPress?.(routine) || onPressDetail?.(routine)}
      activeOpacity={0.7}
    >
      <Card>
        <View className="p-4 gap-3">
          {/* Header */}
          <View className="gap-1">
            <View className="flex-row items-center justify-between">
              <Text numberOfLines={2} className="flex-1 mr-1 text-lg font-bold" style={{ color: textColor }}>
                {routine.routine_name}
              </Text>
              <StatusPill status={status} />
            </View>

            <View className="flex-row flex-wrap gap-1">
              <Text style={{ color: metaColor, fontSize: 12 }}>
                {minutesToLabel(estimatedDuration)}
              </Text>
              <Text style={{ color: metaColor, fontSize: 12 }}>• {difficulty}</Text>
            </View>

            <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 8 }} />

            <Text numberOfLines={2} style={{ color: metaColor, fontSize: 12 }}>
              {exerciseCount} ejercicios •{' '}
              {exercises
                .slice(0, 3)
                .map((e) => e.exercise_name)
                .join(', ')}
              {exerciseCount > 3 ? '…' : ''}
            </Text>

            <View className="flex-row flex-wrap gap-1">
              {muscleGroups.slice(0, 4).map((mg) => (
                <MetaChip key={mg}>{mg}</MetaChip>
              ))}
            </View>
          </View>

          {/* Botones */}
          <View className="flex-row gap-2 pt-2 border-t" style={{ borderTopColor: borderColor }}>
            {/* Botón Detalle */}
            <TouchableOpacity
              onPress={() => onPressDetail?.(routine)}
              className="flex-1 py-2.5 rounded-lg border items-center justify-center"
              style={{
                borderColor: primaryColor,
                backgroundColor: buttonBgColor,
              }}
              activeOpacity={0.6}
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: primaryColor }}
              >
                Detalle
              </Text>
            </TouchableOpacity>

            {/* Botón Empezar Rutina */}
            <TouchableOpacity
              onPress={() => onPressStart?.(routine)}
              className="flex-1 py-2.5 rounded-lg items-center justify-center"
              style={{
                backgroundColor: primaryColor,
              }}
              activeOpacity={0.7}
            >
              <Text
                className="font-semibold text-sm text-white"
              >
                Empezar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
