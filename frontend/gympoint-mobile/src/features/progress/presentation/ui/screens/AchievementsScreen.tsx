import React, { useCallback, useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SurfaceScreen, BackButton } from '@shared/components/ui';
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
      <SurfaceScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#3B82F6'} />
          <Text className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Cargando logros...
          </Text>
        </View>
      </SurfaceScreen>
    );
  }

  return (
    <SurfaceScreen
      scroll
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 140,
        gap: 24,
      }}
    >
      {/* Header */}
      <View className="gap-3">
        <BackButton onPress={handleBackPress} />

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

      {/* Empty State */}
      {achievements.length === 0 && (
        <View
          className="px-5 py-8 rounded-[28px] items-center border"
          style={{
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
          }}
        >
          <View
            className="w-14 h-14 rounded-[20px] border items-center justify-center mb-4"
            style={{
              backgroundColor: isDark ? 'rgba(107, 114, 128, 0.22)' : 'rgba(156, 163, 175, 0.18)',
              borderColor: isDark ? 'rgba(107, 114, 128, 0.38)' : 'rgba(156, 163, 175, 0.24)',
            }}
          >
            <Ionicons name="trophy-outline" size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </View>
          <Text
            className="text-lg font-bold"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            No hay logros todavía
          </Text>
          <Text
            className="mt-1.5 text-[13px] font-medium leading-[18px] text-center"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            Seguí entrenando para desbloquear logros y ganar tokens
          </Text>
        </View>
      )}

      {/* Logros Desbloqueados */}
      {unlockedAchievements.length > 0 && (
        <View className="gap-3">
          <Text
            className="text-sm font-bold uppercase"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.8 }}
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
        <View className="gap-3">
          <Text
            className="text-sm font-bold uppercase"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.8 }}
          >
            Por desbloquear
          </Text>
          {lockedAchievements.map((achievement) => (
            <LockedAchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </View>
      )}
    </SurfaceScreen>
  );
}
