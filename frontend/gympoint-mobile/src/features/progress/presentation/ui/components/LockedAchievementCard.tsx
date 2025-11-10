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

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 26,
        elevation: 12,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 22,
        elevation: 6,
      };

  return (
    <View
      className="border rounded-[28px] px-5 py-[18px]"
      style={[
        {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row items-start">
        {/* Icon Container */}
        <View className="mr-4">
          <View
            className="w-14 h-14 rounded-[20px] border items-center justify-center opacity-40"
            style={{
              backgroundColor: isDark ? 'rgba(107, 114, 128, 0.22)' : 'rgba(156, 163, 175, 0.18)',
              borderColor: isDark ? 'rgba(107, 114, 128, 0.38)' : 'rgba(156, 163, 175, 0.24)',
            }}
          >
            <Ionicons
              name="trophy-outline"
              size={22}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
          </View>
        </View>

        <View className="flex-1">
          {/* Category Badge */}
          <View className="mb-2">
            <AchievementCategoryBadge category={achievement.category} />
          </View>

          <Text
            className="text-lg font-bold"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            {achievement.title}
          </Text>

          {achievement.description && (
            <Text
              className="mt-1.5 text-[13px] font-medium leading-[18px]"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              {achievement.description}
            </Text>
          )}

          {/* Componente de progreso reutilizable */}
          <View className="mt-3">
            <AchievementProgress current={progress} target={target} showPercentage />
          </View>

          {/* Recompensa de tokens */}
          {achievement.earnedPoints > 0 && (
            <View className="flex-row items-center mt-3">
              <Ionicons name="flash-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text
                className="text-xs font-semibold ml-1.5"
                style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.2 }}
              >
                Gana {achievement.earnedPoints} tokens al completar
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
