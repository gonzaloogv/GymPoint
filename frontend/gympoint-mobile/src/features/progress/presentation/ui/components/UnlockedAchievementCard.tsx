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

  return (
    <View
      className={`p-4 rounded-xl mb-3 ${
        isDark ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300'
      }`}
      style={{
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Badge de categoría */}
      <View className="mb-2">
        <AchievementCategoryBadge category={achievement.category} />
      </View>

      <View className="flex-row items-start">
        <View className="mr-3">
          <Text style={{ fontSize: 48 }}>{achievement.icon}</Text>
          {/* Indicador de completado */}
          <View
            className="absolute -top-1 -right-1 bg-green-500 rounded-full items-center justify-center"
            style={{ width: 20, height: 20 }}
          >
            <Ionicons name="checkmark" size={14} color="white" />
          </View>
        </View>
        <View className="flex-1">
          <Text
            className="font-bold text-lg mb-1"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            {achievement.title}
          </Text>

          {achievement.description && (
            <Text className={`text-xs mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {achievement.description}
            </Text>
          )}

          {/* Tokens ganados */}
          {achievement.earnedPoints > 0 && (
            <View
              className={`flex-row items-center px-3 py-2 rounded-lg mb-2 ${
                isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'
              }`}
            >
              <Ionicons name="flash" size={18} color="#EAB308" />
              <Text className="text-yellow-600 font-bold text-sm ml-1.5">
                +{achievement.earnedPoints} tokens ganados
              </Text>
            </View>
          )}

          {/* Fecha de desbloqueo */}
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text className={`text-xs ml-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              Desbloqueado {achievement.date}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
