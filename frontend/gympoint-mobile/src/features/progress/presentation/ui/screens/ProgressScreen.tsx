import React, { useCallback, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SurfaceScreen } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { useProgress } from '@features/progress/presentation/hooks/useProgress';
import { useHomeStore } from '@features/home/presentation/state/home.store';
import { useAchievementsStore } from '@features/progress/presentation/state/achievements.store';
import { ProgressSection } from '../components/ProgressSection';
import { ProgressOverviewHeader } from '../components/ProgressOverviewHeader';
import { RoutinesLayout } from '@features/routines/presentation/ui/layouts';

type ProgressShortcut = {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  onPress: () => void;
};

type ProgressScreenProps = {
  navigation: any;
};

export function ProgressScreen({ navigation }: ProgressScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { weeklyWorkouts, fetchWeeklyWorkouts } = useProgress();
  const { user, fetchHomeData } = useHomeStore();
  const { achievements, fetchAchievements } = useAchievementsStore();

  useEffect(() => {
    fetchHomeData();
    fetchWeeklyWorkouts(); // Cargar workouts semanales reales del backend
    fetchAchievements(); // Cargar logros del usuario
  }, []);

  const currentStreak = user?.streak || 0;
  const currentWeeklyWorkouts = weeklyWorkouts; // Usar siempre el valor del progress store (datos reales)

  // Calcular medallas obtenidas este mes
  const monthlyAchievements = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return achievements.filter((achievement) => {
      if (!achievement.isUnlocked || !achievement.unlockedAt) return false;

      const unlockedDate = new Date(achievement.unlockedAt);
      return (
        unlockedDate.getMonth() === currentMonth &&
        unlockedDate.getFullYear() === currentYear
      );
    }).length;
  }, [achievements]);

  const handleNavigateToPhysicalProgress = useCallback(() => {
    navigation?.navigate('PhysicalProgress');
  }, [navigation]);

  const handleNavigateToAchievements = useCallback(() => {
    navigation?.navigate('Achievements');
  }, [navigation]);

  const progressShortcuts: ProgressShortcut[] = useMemo(
    () => [
      {
        key: 'physical',
        title: 'Progreso fisico',
        description: 'Peso, medidas y composicion corporal',
        icon: <Ionicons name="scale" size={22} color={isDark ? '#C7D2FE' : '#4338CA'} />,
        badge: 'Mediciones',
        onPress: handleNavigateToPhysicalProgress,
      },
      {
        key: 'exercise',
        title: 'Progreso por ejercicio',
        description: 'PRs, volumen y mejoras tecnicas',
        icon: <Ionicons name="trending-up" size={22} color={isDark ? '#C7D2FE' : '#4338CA'} />,
        badge: 'Historial',
        onPress: () => navigation?.navigate('ExerciseProgress'),
      },
      {
        key: 'achievements',
        title: 'Logros',
        description: `${monthlyAchievements} ${monthlyAchievements === 1 ? 'medalla obtenida' : 'medallas obtenidas'} este mes`,
        icon: <Ionicons name="trophy" size={22} color={isDark ? '#FBBF24' : '#D97706'} />,
        badge: 'Reconocimientos',
        onPress: handleNavigateToAchievements,
      },
      {
        key: 'trends',
        title: 'Tendencias',
        description: 'Predicciones y analisis de datos',
        icon: <Ionicons name="bar-chart" size={22} color={isDark ? '#93C5FD' : '#1D4ED8'} />,
        badge: 'Analitica',
        onPress: () => {},
      },
    ],
    [handleNavigateToAchievements, handleNavigateToPhysicalProgress, isDark, navigation, monthlyAchievements],
  );

  const renderShortcut = useCallback(
    ({ item }: { item: ProgressShortcut }) => (
      <ProgressSection
        icon={item.icon}
        title={item.title}
        description={item.description}
        onPress={item.onPress}
        badge={item.badge}
      />
    ),
    [],
  );

  const keyExtractor = useCallback((item: ProgressShortcut) => item.key, []);

  return (
    <SurfaceScreen>
      <RoutinesLayout
        data={progressShortcuts}
        keyExtractor={keyExtractor}
        renderItem={renderShortcut}
        ListHeaderComponent={
          <ProgressOverviewHeader
            streak={currentStreak}
            weeklyWorkouts={currentWeeklyWorkouts}
          />
        }
        contentContainerStyle={{ paddingBottom: 140 }}
      />
    </SurfaceScreen>
  );
}
