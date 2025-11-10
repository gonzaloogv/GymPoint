import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../../../domain/entities/Achievement';
import { useTheme } from '@shared/hooks';
import { AchievementCategoryBadge } from './AchievementCategoryBadge';

interface UnlockedAchievementCardProps {
  achievement: Achievement;
}

export const UnlockedAchievementCard: React.FC<UnlockedAchievementCardProps> = ({ achievement }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 26,
        elevation: 12,
      }
    : {
        shadowColor: '#10B981',
        shadowOpacity: 0.15,
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
          borderColor: isDark ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.3)',
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row items-start">
        {/* Icon Container */}
        <View className="mr-4">
          <View
            className="w-14 h-14 rounded-[20px] border items-center justify-center"
            style={{
              backgroundColor: isDark ? 'rgba(34, 197, 94, 0.22)' : 'rgba(34, 197, 94, 0.18)',
              borderColor: isDark ? 'rgba(34, 197, 94, 0.38)' : 'rgba(34, 197, 94, 0.24)',
            }}
          >
            <Ionicons
              name="trophy"
              size={22}
              color={isDark ? '#86EFAC' : '#16A34A'}
            />
            {/* Indicador de completado */}
            <View
              className="absolute -top-1 -right-1 bg-green-500 rounded-full items-center justify-center"
              style={{ width: 18, height: 18 }}
            >
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
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

          {/* Tokens ganados */}
          {achievement.earnedPoints > 0 && (
            <View className="flex-row items-center mt-3">
              <Ionicons name="flash" size={16} color="#FACC15" />
              <Text
                className="text-xs font-semibold uppercase ml-1.5"
                style={{ color: '#FACC15', letterSpacing: 0.6 }}
              >
                +{achievement.earnedPoints} tokens ganados
              </Text>
            </View>
          )}

          {/* Fecha de desbloqueo */}
          <View className="flex-row items-center mt-2">
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text
              className="text-xs font-semibold ml-1"
              style={{ color: isDark ? '#86EFAC' : '#16A34A', letterSpacing: 0.2 }}
            >
              Desbloqueado {achievement.date}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
