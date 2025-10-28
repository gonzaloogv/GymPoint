import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../../../domain/entities/Achievement';
import { useTheme } from '@shared/hooks';
import { AchievementProgress } from './AchievementProgress';
import { AchievementCategoryBadge } from './AchievementCategoryBadge';

interface LockedAchievementCardProps {
  achievement: Achievement;
}

export const LockedAchievementCard: React.FC<LockedAchievementCardProps> = ({ achievement }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const progress = achievement.currentProgress || 0;
  const target = achievement.targetValue;

  return (
    <View
      className={`p-4 rounded-xl mb-3 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
      }`}
    >
      {/* Badge de categoría */}
      <View className="mb-2">
        <AchievementCategoryBadge category={achievement.category} />
      </View>

      <View className="flex-row items-start">
        <View className="mr-3 opacity-40">
          <Text style={{ fontSize: 48 }}>{achievement.icon}</Text>
        </View>
        <View className="flex-1">
          <Text className={`font-bold text-lg mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            {achievement.title}
          </Text>

          {achievement.description && (
            <Text className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {achievement.description}
            </Text>
          )}

          {/* Componente de progreso reutilizable */}
          <AchievementProgress current={progress} target={target} showPercentage />

          {/* Recompensa de tokens */}
          {achievement.earnedPoints > 0 && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="flash-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Gana {achievement.earnedPoints} tokens al completar
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
