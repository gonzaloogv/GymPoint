import { View, Text } from 'react-native';
import { Card } from '@shared/components/ui';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useTheme } from '@shared/hooks';

type Props = {
  current: number;
  goal: number;
  progressPct: number; // 0..100
  streak: number;
  onStats?: () => void;
};

export default function WeeklyProgressCard({
  current,
  goal,
  progressPct,
  streak,
  onStats,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card className="flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${isDark ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
          <FeatherIcon name="target" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
        </View>
        <View className="flex-1">
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-textSecondary'}`}>
            Meta semanal
          </Text>
          <Text className={`text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-textPrimary'}`}>
            {current} de {goal} entrenamientos
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        <FeatherIcon name="trending-up" size={16} color={isDark ? '#4ade80' : '#10b981'} style={{ marginRight: 4 }} />
        <Text className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{streak}</Text>
      </View>
    </Card>
  );
}
