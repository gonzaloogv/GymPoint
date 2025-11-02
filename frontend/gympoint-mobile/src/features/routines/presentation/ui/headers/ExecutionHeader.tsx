import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';
import { formatDuration } from '@shared/utils';
import { ExecutionStatsCard } from '../components/ExecutionStatsCard';

type Props = {
  routineName: string;
  duration: number; // segundos
  totalVolume: number; // kg
  setsCompleted: number;
  totalSets: number;
  onTerminate: () => void;
};

/**
 * Header para pantalla de ejecución
 * Muestra nombre, stats en tiempo real, y botón terminar
 */
export function ExecutionHeader({
  routineName,
  duration,
  totalVolume,
  setsCompleted,
  totalSets,
  onTerminate,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <View className="p-4 gap-4">
      {/* Título y botón Terminar */}
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-black flex-1" style={{ color: textColor }}>
          {routineName}
        </Text>
        <TouchableOpacity
          onPress={onTerminate}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: '#3b82f6',
          }}
          activeOpacity={0.7}
        >
          <Text className="text-white font-semibold text-sm">
            Terminar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View className="flex-row gap-2">
        <ExecutionStatsCard
          label="Duración"
          value={formatDuration(duration)}
          variant="accent"
        />
        <ExecutionStatsCard
          label="Volumen"
          value={`${totalVolume.toFixed(0)}kg`}
          variant="default"
        />
        <ExecutionStatsCard
          label="Series"
          value={`${setsCompleted}/${totalSets}`}
          variant="success"
        />
      </View>
    </View>
  );
}
