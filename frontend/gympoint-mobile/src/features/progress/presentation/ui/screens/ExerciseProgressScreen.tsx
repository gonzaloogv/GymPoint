import { useState } from 'react';
import { FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Screen } from '@shared/components/ui/Screen';
import { EmptyState } from '@shared/components/ui/EmptyState';
import { useExerciseProgress } from '@features/progress/presentation/hooks';
import {
  ExerciseCard,
  VolumeChart,
  RecordCard,
} from '@features/progress/presentation/ui/components';
import { ExerciseProgressDetail } from '@features/progress/domain/entities';

const Header = styled.View`
  padding: 16px;
  background-color: ${({ theme }) => theme?.colors?.bg ?? '#fff'};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme?.colors?.border ?? '#e5e7eb'};
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BackButton = styled(TouchableOpacity)`
  margin-right: 12px;
  padding: 4px;
`;

const BackIcon = styled.Text`
  font-size: 20px;
  color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
`;

const BackText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
  margin-left: 4px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme?.colors?.subtext ?? '#6b7280'};
  margin-bottom: 16px;
`;

const Content = styled.View`
  flex: 1;
  padding: 0 16px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const DetailContainer = styled.View`
  padding: 16px;
`;

interface Props {
  navigation?: any;
  route?: any;
}

export default function ExerciseProgressScreen({ navigation, route }: Props) {
  const userId = route?.params?.userId || 'user-1';
  const { exercises, loading, error } = useExerciseProgress(userId);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseProgressDetail | null>(
    null
  );

  if (loading) {
    return (
      <Screen>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#635BFF" />
        </LoadingContainer>
      </Screen>
    );
  }

  if (error || exercises.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Sin progreso registrado"
          description="Completa entrenamientos para ver tu progreso por ejercicio"
          buttonText="Ir a Rutinas"
          onButtonPress={() => navigation?.navigate?.('Routines')}
        />
      </Screen>
    );
  }

  if (selectedExercise) {
    return (
      <Screen scroll>
        <Header>
          <Row>
            <BackButton onPress={() => setSelectedExercise(null)}>
              <Row>
                <BackIcon>←</BackIcon>
                <BackText>Volver</BackText>
              </Row>
            </BackButton>
          </Row>
        </Header>
        <DetailContainer>
          <Title>{selectedExercise.exerciseName}</Title>
          <Subtitle>RM estimado: {selectedExercise.estimatedRM} kg</Subtitle>

          <RecordCard type="PR" record={selectedExercise.personalRecords} />
          <RecordCard type="BestSerie" bestSerie={selectedExercise.bestSerie} />

          <VolumeChart data={selectedExercise.weeklyVolume} />
        </DetailContainer>
      </Screen>
    );
  }

  const handleBack = () => {
    navigation?.goBack?.();
  };

  return (
    <Screen>
      <Header>
        <Row>
          <BackButton onPress={handleBack}>
            <Row>
              <BackIcon>←</BackIcon>
              <BackText>Volver al progreso</BackText>
            </Row>
          </BackButton>
        </Row>
        <Title>Progreso por Ejercicio</Title>
        <Subtitle>PRs, volumen y mejoras técnicas</Subtitle>
      </Header>

      <Content>
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.exerciseId}
          renderItem={({ item, index }) => (
            <ExerciseCard
              exercise={item}
              onPress={() => setSelectedExercise(item)}
              style={index === 0 ? { marginTop: 16 } : {}}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </Content>
    </Screen>
  );
}
