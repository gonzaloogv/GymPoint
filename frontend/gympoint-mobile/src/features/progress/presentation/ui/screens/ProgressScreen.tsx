import React, { useCallback } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '@features/progress/presentation/hooks/useProgress';
import { KPICard } from '../components/KPICard';
import { ProgressSection } from '../components/ProgressSection';

type ProgressScreenProps = {
  navigation: any;
};

export function ProgressScreen({ navigation }: ProgressScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { currentStreak, weeklyWorkouts } = useProgress();

  const handleNavigateToPhysicalProgress = useCallback(() => {
    navigation?.navigate('PhysicalProgress');
  }, [navigation]);

  const handleNavigateToAchievements = useCallback(() => {
    navigation?.navigate('Achievements');
  }, [navigation]);

  return (
    <Screen scroll safeAreaTop safeAreaBottom>
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Progreso
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* KPI Cards */}
          <View className="flex-row px-4 pb-6 gap-2">
            <KPICard
              icon={<Ionicons name="flame" size={24} color="#FF6B35" />}
              label="Racha actual"
              value={`${currentStreak} días`}
              change={7}
              changeType="up"
            />
            <KPICard
              icon={<Ionicons name="checkmark-circle" size={24} color="#FF6B35" />}
              label="Esta semana"
              value={`${weeklyWorkouts} entrenamientos`}
              change={1}
              changeType="up"
            />
          </View>

          {/* Info Card - ¿Cómo ganar más tokens? */}
          <Pressable
            className={`mx-4 p-4 rounded-xl mb-6 flex-row items-center justify-between ${
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
                ¿Cómo ganar más tokens?
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#D8B4FE' : '#A78BFA'}
            />
          </Pressable>

          {/* Progress Sections */}
          <ProgressSection
            icon={<Ionicons name="scale" size={24} color="#9CA3AF" />}
            title="Progreso Físico"
            description="Peso, medidas y composición corporal"
            onPress={handleNavigateToPhysicalProgress}
          />

          <ProgressSection
            icon={<Ionicons name="trending-up" size={24} color="#9CA3AF" />}
            title="Progreso por Ejercicio"
            description="PRs, volumen y mejoras técnicas"
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
            description="Predicciones y análisis de datos"
            onPress={() => {}}
          />

          <View className="h-8" />
        </ScrollView>
      </View>
    </Screen>
  );
}
