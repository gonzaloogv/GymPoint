import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

export default function DailyChallengeCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const completed = 1;
  const total = 3;
  const progressPercentage = (completed / total) * 100;

  return (
    <TouchableOpacity activeOpacity={0.8} className="flex-1">
      <Card className={`${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
        <View className="flex-row items-start">
          <View className={`w-12 h-12 rounded-lg items-center justify-center mr-3 flex-shrink-0 ${isDark ? 'bg-amber-500/20' : 'bg-pink-200'}`}>
            <Text className="text-lg">🏆</Text>
          </View>

          <View className="flex-1">
            <Text className={`font-bold text-base ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              Desafío del día
            </Text>
            <Text className={`mt-1 ${isDark ? 'text-gray-400' : 'text-textSecondary'}`}>
              Entrena 3 grupos musculares
            </Text>

            <View className={`mt-3 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
              <View
                className="h-full bg-purple-600 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>

            <Text className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-textSecondary'}`}>
              Progreso: {completed}/{total} completado
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
