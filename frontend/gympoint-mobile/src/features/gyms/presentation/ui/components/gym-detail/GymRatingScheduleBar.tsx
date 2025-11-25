import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface GymRatingScheduleBarProps {
  averageRating: number;
  totalReviews: number;
  scheduleText: string;
}

export function GymRatingScheduleBar({
  averageRating,
  totalReviews,
  scheduleText,
}: GymRatingScheduleBarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className="flex-row items-center justify-between px-4 pb-3">
      {/* Rating Block */}
      {totalReviews > 0 ? (
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={16} color={isDark ? '#FACC15' : '#D97706'} />
            <Text className={`text-base font-bold ${isDark ? 'text-gray-50' : 'text-gray-900'}`}>
              {averageRating.toFixed(1)}
            </Text>
          </View>
          <Text className={`text-[13px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            ({totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'})
          </Text>
        </View>
      ) : (
        <Text className={`text-[13px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Sin reseñas aún
        </Text>
      )}

      {/* Schedule Block */}
      <View className="flex-row items-center gap-1.5">
        <Feather name="clock" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <Text className={`text-[13px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {scheduleText}
        </Text>
      </View>
    </View>
  );
}
