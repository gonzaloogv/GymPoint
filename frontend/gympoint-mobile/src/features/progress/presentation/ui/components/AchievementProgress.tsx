import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

interface AchievementProgressProps {
  current: number;
  target: number;
  showPercentage?: boolean;
}

export const AchievementProgress: React.FC<AchievementProgressProps> = ({
  current,
  target,
  showPercentage = true
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <View className="mb-2">
      {/* Barra de progreso */}
      <View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
        <View
          className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </View>

      {/* Texto de progreso */}
      <View className="flex-row justify-between mt-1">
        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {current} / {target}
        </Text>
        {showPercentage && (
          <Text className={`text-xs font-semibold ${
            isComplete
              ? 'text-green-500'
              : isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            {percentage.toFixed(0)}%
          </Text>
        )}
      </View>
    </View>
  );
};
