import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { H1 } from '@shared/components/ui';

type Props = {
  routineName: string;
  sessionsCount: number;
};

export function HistoryHeader({ routineName, sessionsCount }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <View className="p-4 gap-0.5">
      <H1>Historial</H1>
      <Text style={{ color: subtextColor }}>{routineName}</Text>
      <Text style={{ color: subtextColor }}>{sessionsCount} sesiones registradas</Text>
    </View>
  );
}
