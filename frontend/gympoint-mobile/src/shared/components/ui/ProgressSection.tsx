import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { ProgressFill, ProgressTrack } from './ProgressBar';

type Props = {
  current: number;
  goal: number;
  progressPct: number; // 0..100
  label?: string;
  description?: string;
};

export function ProgressSection({
  current,
  goal,
  progressPct,
  label = 'Meta semanal',
  description,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const displayDescription = description || `${current} de ${goal} entrenamientos`;

  return (
    <View className="gap-2">
      <View className="flex-row justify-between items-center">
        <Text className={isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}>
          {label}
        </Text>
        <Text className={isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}>
          {displayDescription}
        </Text>
      </View>

      <ProgressTrack>
        <ProgressFill value={progressPct} />
      </ProgressTrack>
    </View>
  );
}
