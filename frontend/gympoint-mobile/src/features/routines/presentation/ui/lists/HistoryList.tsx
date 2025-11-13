import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Card } from '@shared/components/ui';
import type { RoutineSession } from '@features/routines/domain/entities';

type Props = {
  sessions: RoutineSession[];
};

export function HistoryList({ sessions }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const renderItem = ({ item }: { item: RoutineSession }) => (
    <Card className="mx-4">
      <View className="p-2 gap-0.5">
        <View className="flex-row justify-between items-center">
          <Text className={`font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
            {new Date(item.date).toLocaleString()}
          </Text>
          <View
            className={`w-2.5 h-2.5 rounded-full ${
              item.completed
                ? 'bg-primary'
                : isDark
                  ? 'bg-border-dark'
                  : 'bg-border'
            }`}
          />
        </View>
        <Text className={`text-sm ${isDark ? 'text-subtext-dark' : 'text-subtext'}`}>
          Duración: {item.durationMin} min
        </Text>
        <Text className={`text-sm ${isDark ? 'text-subtext-dark' : 'text-subtext'}`}>
          {item.completed ? 'Completada' : 'Incompleta'}
        </Text>
      </View>
    </Card>
  );

  const keyExtractor = (item: RoutineSession) => item.id;

  return {
    renderItem,
    keyExtractor,
  };
}
