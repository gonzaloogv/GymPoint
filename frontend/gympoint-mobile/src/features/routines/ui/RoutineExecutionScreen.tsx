import React from 'react';
import { FlatList } from 'react-native';

import { Button, ButtonText } from '@shared/components/ui';
import { useRoutineExecution } from '../hooks/useRoutineExecution';
import { ExerciseDetails } from './components';
import {
  Screen,
  Header,
  Title,
  Subtitle,
  ProgressTrack,
  ProgressBar,
  Footer,
  OutlineButton,
  OutlineLabel,
} from './styles/execution';

type RoutineExecutionScreenProps = {
  route: { params?: { id?: string } };
  navigation: { goBack?: () => void };
};

const RoutineExecutionScreen: React.FC<RoutineExecutionScreenProps> = ({ route, navigation }) => {
  const id = route?.params?.id;
  const {
    routineName,
    currentExercise,
    exerciseIndex,
    totalExercises,
    totalSets,
    currentSet,
    restSeconds,
    progressPct,
    goToPrevious,
    goToNext,
    completeSet,
  } = useRoutineExecution({ id, onComplete: navigation?.goBack });

  const header = (
    <Header>
      <Title>{routineName}</Title>
      <Subtitle>{`Ejercicio ${exerciseIndex + 1} de ${totalExercises}`}</Subtitle>
      <ProgressTrack>
        <ProgressBar $pct={progressPct} />
      </ProgressTrack>
    </Header>
  );

  return (
    <Screen edges={['top', 'left', 'right']}>
      <FlatList
        data={[currentExercise]}
        keyExtractor={(exercise) => exercise.id}
        ListHeaderComponent={header}
        renderItem={() => (
          <ExerciseDetails
            exercise={currentExercise}
            totalSets={totalSets}
            currentSet={currentSet}
            restSeconds={restSeconds}
          />
        )}
        contentContainerStyle={{ paddingBottom: 96 }}
      />

      <Footer>
        <Button onPress={completeSet}>
          <ButtonText>
            {currentSet < totalSets
              ? 'Marcar serie completa'
              : exerciseIndex < totalExercises - 1
                ? 'Continuar al siguiente'
                : 'Finalizar'}
          </ButtonText>
        </Button>

        <OutlineButton onPress={goToPrevious} disabled={exerciseIndex === 0}>
          <OutlineLabel>Anterior</OutlineLabel>
        </OutlineButton>

        <OutlineButton onPress={goToNext} disabled={exerciseIndex === totalExercises - 1}>
          <OutlineLabel>Siguiente</OutlineLabel>
        </OutlineButton>
      </Footer>
    </Screen>
  );
};

export default RoutineExecutionScreen;
