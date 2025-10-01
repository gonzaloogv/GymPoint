import styled from 'styled-components/native';
import { Card } from './Card';
import { SetPill } from './SetPill';

const ExerciseCardContainer = styled.View`
  margin: 0 16px;
`;

const CardContent = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const ExerciseName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
`;

const ExerciseMeta = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const SetsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

type Exercise = {
  id: string;
  name: string;
  sets: number | string;
  reps: string;
  rest: number;
  muscleGroups: string[];
};

type Props = {
  exercise: Exercise;
  totalSets: number;
  currentSet: number;
  restSeconds: number;
};

export function ExerciseCard({ exercise, totalSets, currentSet, restSeconds }: Props) {
  return (
    <ExerciseCardContainer>
      <Card>
        <CardContent>
          <ExerciseName>{exercise.name}</ExerciseName>
          <ExerciseMeta>
            {`Series: ${totalSets} • Reps objetivo: ${exercise.reps} • Descanso: ${exercise.rest}s`}
          </ExerciseMeta>

          <SetsRow>
            {Array.from({ length: totalSets }).map((_, index) => {
              const setNumber = index + 1;
              const done = setNumber < currentSet;
              const isCurrent = setNumber === currentSet;
              return (
                <SetPill
                  key={setNumber}
                  setNumber={setNumber}
                  done={done}
                  current={isCurrent}
                />
              );
            })}
          </SetsRow>

          {restSeconds > 0 ? (
            <ExerciseMeta>{`Descanso: ${restSeconds}s`}</ExerciseMeta>
          ) : null}
        </CardContent>
      </Card>
    </ExerciseCardContainer>
  );
}
