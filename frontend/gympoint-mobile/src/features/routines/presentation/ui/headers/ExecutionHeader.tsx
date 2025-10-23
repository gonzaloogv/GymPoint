import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

type Props = {
  routineName: string;
  exerciseIndex: number;
  totalExercises: number;
  progressPct: number;
};

export function ExecutionHeader({
  routineName,
  exerciseIndex,
  totalExercises,
  progressPct,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const trackBg = isDark ? '#374151' : '#e5e7eb';

  return (
    <View className="p-4 gap-0.5">
      <Text className="text-2xl font-black" style={{ color: textColor }}>
        {routineName}
      </Text>
      <Text style={{ color: subtextColor }}>Ejercicio {exerciseIndex + 1} de {totalExercises}</Text>
      <View className="h-2 rounded-full overflow-hidden my-1" style={{ backgroundColor: trackBg }}>
        <View
          style={{
            width: `${Math.max(0, Math.min(100, progressPct))}%`,
            height: 8,
            backgroundColor: '#3B82F6',
          }}
        />
      </View>
    </View>
  );
}
