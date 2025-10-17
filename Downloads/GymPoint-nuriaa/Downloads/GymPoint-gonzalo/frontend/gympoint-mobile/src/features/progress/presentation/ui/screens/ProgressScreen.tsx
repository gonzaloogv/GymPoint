import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { useProgress } from '@features/progress/presentation/hooks/useProgress';
import {
  ProgressHeader,
  StreakCard,
  TokenTipsButton,
  ProgressSection,
  AchievementsBadge,
} from '@features/progress/presentation/ui/components';
import {
  ScrollContainer,
  Content,
  StatsRow,
  SectionsContainer,
} from '@features/progress/presentation/ui/styles';

interface ProgressScreenProps {
  navigation?: any;
  userId?: string;
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ navigation, userId = 'user-1' }) => {
  const { progress, loading, error } = useProgress(userId);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
        <Content style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </Content>
      </SafeAreaView>
    );
  }

  if (error || !progress) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
        <Content style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ErrorText>Error al cargar progreso</ErrorText>
        </Content>
      </SafeAreaView>
    );
  }

  const handleTokenTips = () => {
    // Navegar a pantalla de Recompensas
    navigation?.navigate?.('Rewards');
  };

  const handlePhysicalProgress = () => {
    navigation?.navigate?.('PhysicalProgress', { userId });
  };

  const handleExerciseProgress = () => {
    navigation?.navigate?.('ExerciseProgress', { userId });
  };

  const handleAchievements = () => {
    navigation?.navigate?.('Achievements', { userId });
  };

  const handleTrends = () => {
    // TODO: Navegar a tendencias
    console.log('Ver tendencias');
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      edges={['top', 'left', 'right']}
    >
      <ScrollContainer
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Content>
          <ProgressHeader />

          {/* Stats Cards */}
          <StatsRow>
            <StreakCard
              icon={progress.streak.icon}
              label="Racha actual"
              value={`${progress.streak.currentStreak} días`}
              change={progress.streak.change}
            />
            <StreakCard
              icon={progress.weekly.icon}
              label="Esta semana"
              value={`${progress.weekly.workoutsThisWeek} entrenamientos`}
              change={progress.weekly.change}
            />
          </StatsRow>

          {/* Token Tips Button */}
          <TokenTipsButton onPress={handleTokenTips} />

          {/* Progress Sections */}
          <SectionsContainer>
            <ProgressSection
              icon="⚖️"
              title="Progreso Físico"
              subtitle="Peso, medidas y composición corporal"
              onPress={handlePhysicalProgress}
            />

            <ProgressSection
              icon="📈"
              title="Progreso por Ejercicio"
              subtitle="PRs, volumen y mejoras técnicas"
              onPress={handleExerciseProgress}
            />

            <AchievementsBadge
              icon="🏆"
              title="Logros"
              count={progress.achievements.length}
              onPress={handleAchievements}
            />

            <ProgressSection
              icon="📊"
              title="Tendencias"
              subtitle="Predicciones y análisis de datos"
              onPress={handleTrends}
            />
          </SectionsContainer>
        </Content>
      </ScrollContainer>
    </SafeAreaView>
  );
};

// Error component
const ErrorText = styled.Text`
  color: #ef4444;
  font-size: 14px;
`;

export default ProgressScreen;
