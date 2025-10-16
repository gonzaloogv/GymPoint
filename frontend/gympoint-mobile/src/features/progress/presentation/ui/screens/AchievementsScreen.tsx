import { useState } from 'react';
import { FlatList, ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';
import { Screen } from '@shared/components/ui/Screen';
import { EmptyState } from '@shared/components/ui/EmptyState';
import { useAchievements } from '@features/progress/presentation/hooks';
import {
  AchievementCard,
  AchievementCategoryTabs,
  AchievementHeader,
  NewAchievementBanner,
} from '@features/progress/presentation/ui/components';

const Content = styled.View`
  flex: 1;
`;

const TabsContainer = styled.View`
  padding: 16px;
  background-color: ${({ theme }) => theme?.colors?.bg ?? '#fff'};
`;

const GridContainer = styled.View`
  flex: 1;
  padding: 0 16px;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

interface Props {
  navigation?: any;
  route?: any;
}

export default function AchievementsScreen({ navigation, route }: Props) {
  const userId = route?.params?.userId || 'user-1';
  const { achievements, loading, error } = useAchievements(userId);
  const [category, setCategory] = useState('all');

  // Helper para obtener el progreso de cada achievement bloqueado
  const getAchievementProgress = (achievementId: string): number => {
    const progressMap: Record<string, number> = {
      '4': 45,  // Mes completo
      '5': 30,  // 100 entrenamientos
      '6': 0,   // Maratonista
    };
    return progressMap[achievementId] || 0;
  };

  // Filtrar achievements por categoría
  const filteredAchievements =
    category === 'all'
      ? achievements
      : achievements.filter((a) => a.category === category);

  // Encontrar el achievement más reciente (para el banner)
  const latestAchievement = achievements.length > 0 ? achievements[0] : null;

  // Agrupar en pares para el grid
  const groupedAchievements: any[][] = [];
  for (let i = 0; i < filteredAchievements.length; i += 2) {
    groupedAchievements.push(filteredAchievements.slice(i, i + 2));
  }

  const handleBack = () => {
    navigation?.goBack?.();
  };

  if (loading) {
    return (
      <Screen>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#635BFF" />
        </LoadingContainer>
      </Screen>
    );
  }

  if (error || achievements.length === 0) {
    return (
      <Screen>
        <AchievementHeader onBack={handleBack} />
        <EmptyState
          title="Sin logros aún"
          description="Completa entrenamientos y desafíos para desbloquear logros"
          buttonText="Ir a Rutinas"
          onButtonPress={() => navigation?.navigate?.('Rutinas')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Content>
        <AchievementHeader onBack={handleBack} />

        <TabsContainer>
          <AchievementCategoryTabs value={category} onChange={setCategory} />
        </TabsContainer>

        <GridContainer>
          <FlatList
            data={groupedAchievements}
            keyExtractor={(item, index) => `row-${index}`}
            renderItem={({ item }) => (
              <Row>
                {item.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    locked={!achievement.earnedAt}
                    progress={achievement.earnedAt ? undefined : getAchievementProgress(achievement.id)}
                  />
                ))}
                {item.length === 1 && <View style={{ width: '48%' }} />}
              </Row>
            )}
            ListFooterComponent={
              latestAchievement && latestAchievement.earnedAt ? (
                <NewAchievementBanner achievement={latestAchievement} />
              ) : null
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </GridContainer>
      </Content>
    </Screen>
  );
}
