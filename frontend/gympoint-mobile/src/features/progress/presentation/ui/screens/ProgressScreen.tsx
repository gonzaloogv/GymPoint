import React, { useCallback, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SurfaceScreen } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '@features/progress/presentation/hooks/useProgress';
import { useHomeStore } from '@features/home/presentation/state/home.store';
import { KPICard } from '../components/KPICard';
import { ProgressSection } from '../components/ProgressSection';
import StreakIcon from '@assets/icons/streak.svg';

type ProgressScreenProps = {
  navigation: any;
};

export function ProgressScreen({ navigation }: ProgressScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { weeklyWorkouts } = useProgress();
  const { user, weeklyProgress, fetchHomeData } = useHomeStore();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const currentStreak = user?.streak || 0;
  const currentWeeklyWorkouts = weeklyProgress?.current || weeklyWorkouts;

  const handleNavigateToPhysicalProgress = useCallback(() => {
    navigation?.navigate('PhysicalProgress');
  }, [navigation]);

  const handleNavigateToAchievements = useCallback(() => {
    navigation?.navigate('Achievements');
  }, [navigation]);

  return (
    <SurfaceScreen
      scroll
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 32,
        rowGap: 24,
      }}
    >
      <View className="pt-4 pb-[18px]">
        <Text
          className="text-[28px] font-extrabold"
          style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
        >
          Progreso
        </Text>
        <Text
          className="mt-2 text-xs font-semibold uppercase"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 1.2 }}
        >
          Tu rendimiento y metas
        </Text>
      </View>

      <View className="flex-row gap-2">
        <KPICard
          icon={<StreakIcon width={24} height={24} accessibilityLabel="racha" />}
          label="Racha actual"
          value={`${currentStreak} dias`}
        />
        <KPICard
          icon={<Ionicons name="checkmark-circle" size={24} color="#10B981" />}
          label="Esta semana"
          value={`${currentWeeklyWorkouts} entrenos`}
        />
      </View>

      <Pressable
        className={`p-4 rounded-2xl flex-row items-center justify-between ${
          isDark ? 'bg-purple-900 border border-purple-700' : 'bg-purple-100 border border-purple-300'
        }`}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons
            name="help-circle"
            size={24}
            color={isDark ? '#D8B4FE' : '#A78BFA'}
            style={{ marginRight: 12 }}
          />
          <Text className={`font-semibold flex-1 ${isDark ? 'text-purple-100' : 'text-purple-900'}`}>
            Como ganar mas tokens?
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? '#D8B4FE' : '#A78BFA'}
        />
      </Pressable>

      <ProgressSection
        icon={<Ionicons name="scale" size={24} color="#9CA3AF" />}
        title="Progreso fisico"
        description="Peso, medidas y composicion corporal"
        onPress={handleNavigateToPhysicalProgress}
      />

      <ProgressSection
        icon={<Ionicons name="trending-up" size={24} color="#9CA3AF" />}
        title="Progreso por ejercicio"
        description="PRs, volumen y mejoras tecnicas"
        onPress={() => navigation?.navigate('ExerciseProgress')}
      />

      <ProgressSection
        icon={<Ionicons name="trophy" size={24} color="#9CA3AF" />}
        title="Logros"
        description="6 medallas obtenidas este mes"
        onPress={handleNavigateToAchievements}
      />

      <ProgressSection
        icon={<Ionicons name="bar-chart" size={24} color="#9CA3AF" />}
        title="Tendencias"
        description="Predicciones y analisis de datos"
        onPress={() => {}}
      />

    </SurfaceScreen>
  );
}
