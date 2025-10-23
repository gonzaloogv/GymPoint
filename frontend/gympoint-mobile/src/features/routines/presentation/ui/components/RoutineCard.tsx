import { TouchableOpacity, View, Text } from 'react-native';
import { Card, StatusPill, MetaChip } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

type Routine = {
  id: string;
  name: string;
  status: 'Active' | 'Scheduled' | 'Completed';
  estimatedDuration: number;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  nextScheduled?: string;
  lastPerformed?: string;
  exercises: Array<{
    id: string;
    name: string;
    sets: number | string;
    reps: string;
    rest: number;
    muscleGroups: string[];
  }>;
  muscleGroups: string[];
};

type Props = {
  routine: Routine;
  onPress?: (routine: Routine) => void;
};

function minutesToLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
}

export function RoutineCard({ routine, onPress }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const metaColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const when =
    routine.status === 'Scheduled'
      ? `Próxima: ${routine.nextScheduled}`
      : routine.lastPerformed
        ? `Última: ${routine.lastPerformed}`
        : undefined;

  return (
    <TouchableOpacity onPress={() => onPress?.(routine)} activeOpacity={0.7}>
      <Card>
        <View className="p-4 gap-1">
          <View className="flex-row items-center justify-between">
            <Text numberOfLines={2} className="flex-1 mr-1 text-lg font-bold" style={{ color: isDark ? '#ffffff' : '#000000' }}>
              {routine.name}
            </Text>
            <StatusPill status={routine.status} />
          </View>

          <View className="flex-row flex-wrap gap-1">
            <Text style={{ color: metaColor, fontSize: 12 }}>
              {minutesToLabel(routine.estimatedDuration)}
            </Text>
            <Text style={{ color: metaColor, fontSize: 12 }}>• {routine.difficulty}</Text>
            {when ? <Text style={{ color: metaColor, fontSize: 12 }}>• {when}</Text> : null}
          </View>

          <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 8 }} />

          <Text numberOfLines={2} style={{ color: metaColor, fontSize: 12 }}>
            {routine.exercises.length} ejercicios •{' '}
            {routine.exercises
              .slice(0, 3)
              .map((e) => e.name)
              .join(', ')}
            {routine.exercises.length > 3 ? '…' : ''}
          </Text>

          <View className="flex-row flex-wrap gap-1">
            {routine.muscleGroups.slice(0, 4).map((mg) => (
              <MetaChip key={mg}>{mg}</MetaChip>
            ))}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
