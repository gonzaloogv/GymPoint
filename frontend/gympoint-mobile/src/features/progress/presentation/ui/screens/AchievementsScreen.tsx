import React, { useCallback, useMemo } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useAchievements } from '../../hooks/useAchievements';
import { UnlockedAchievementCard, LockedAchievementCard } from '../components';

type AchievementsScreenProps = {
  navigation: any;
};

export function AchievementsScreen({ navigation }: AchievementsScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { achievements, isLoading } = useAchievements();

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  // Separar achievements desbloqueados y por desbloquear
  const { unlockedAchievements, lockedAchievements } = useMemo(() => {
    const unlocked = achievements.filter(a => a.isUnlocked === true);
    const locked = achievements.filter(a => a.isUnlocked !== true);
    return { unlockedAchievements: unlocked, lockedAchievements: locked };
  }, [achievements]);

  if (isLoading) {
    return (
      <Screen safeAreaTop safeAreaBottom>
        <View className={`flex-1 items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#3B82F6'} />
          <Text className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Cargando logros...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll safeAreaTop safeAreaBottom>
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <View className="px-4 pt-4 pb-[18px] gap-3">
          <Pressable onPress={handleBackPress} className="flex-row items-center -ml-2">
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? '#60A5FA' : '#3B82F6'}
            />
            <Text
              className="text-sm font-semibold"
              style={{ color: isDark ? '#60A5FA' : '#3B82F6' }}
            >
              Volver
            </Text>
          </Pressable>

          <View>
            <Text
              className="text-[28px] font-extrabold"
              style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
            >
              Logros
            </Text>
            <Text
              className="mt-2 text-xs font-semibold uppercase"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 1.2 }}
            >
              {unlockedAchievements.length} desbloqueados • {lockedAchievements.length} disponibles
            </Text>
          </View>

          <View
            className="h-px rounded-full"
            style={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)' }}
          />
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

          {/* Empty State */}
          {achievements.length === 0 && (
            <View
              className={`p-8 rounded-xl items-center ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
              }`}
            >
              <Ionicons name="trophy-outline" size={64} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text
                className="mt-4 text-lg font-semibold"
                style={{ color: isDark ? '#F9FAFB' : '#111827' }}
              >
                No hay logros todavía
              </Text>
              <Text className={`mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Seguí entrenando para desbloquear logros y ganar tokens
              </Text>
            </View>
          )}

          {/* Logros Desbloqueados */}
          {unlockedAchievements.length > 0 && (
            <View className="mb-6">
              <Text
                className="text-lg font-bold mb-3"
                style={{ color: isDark ? '#F9FAFB' : '#111827' }}
              >
                Desbloqueados
              </Text>
              {unlockedAchievements.map((achievement) => (
                <UnlockedAchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </View>
          )}

          {/* Logros Por Desbloquear */}
          {lockedAchievements.length > 0 && (
            <View className="mb-8">
              <Text
                className="text-lg font-bold mb-3"
                style={{ color: isDark ? '#F9FAFB' : '#111827' }}
              >
                Por desbloquear
              </Text>
              {lockedAchievements.map((achievement) => (
                <LockedAchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}
