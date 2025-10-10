import styled from 'styled-components/native';
import { View } from 'react-native';
import { StepScrollContainer, StepSection } from '@shared/components/ui';
import { sp, rad } from '@shared/styles';
import { Exercise } from '@features/routines/domain/entities/Exercise';

const SectionLabel = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => sp(theme, 1.5)}px;
`;

const SummaryCard = styled(View)`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => rad(theme, 'lg', 12)}px;
  padding: ${({ theme }) => sp(theme, 2.5)}px;
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
`;

const SummaryRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => sp(theme, 1.5)}px;
`;

const SummaryLabel = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
  font-weight: 500;
`;

const SummaryValue = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
`;

const ChipsContainer = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: ${({ theme }) => sp(theme, 1)}px;
`;

const Chip = styled(View)`
  background-color: ${({ theme }) => theme.colors.primary}1A;
  padding: 8px 14px;
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
`;

const ChipText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  font-weight: 600;
`;

const ExerciseItem = styled(View)`
  padding: ${({ theme }) => sp(theme, 2)}px;
  background-color: ${({ theme }) => theme.colors.bg};
  border-radius: ${({ theme }) => rad(theme, 'md', 8)}px;
  margin-bottom: ${({ theme }) => sp(theme, 1.5)}px;
`;

const ExerciseName = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 6px;
`;

const ExerciseDetails = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.subtext};
`;

type BasicInfo = {
  name: string;
  objective: string;
  muscleGroups: string[];
};

type Props = {
  basicInfo: BasicInfo;
  exercises: Exercise[];
};

export function ReviewStep({ basicInfo, exercises }: Props) {
  return (
    <StepScrollContainer>
      <StepSection>
        <SectionLabel>Información general</SectionLabel>
        <SummaryCard>
          <SummaryRow>
            <SummaryLabel>Nombre</SummaryLabel>
            <SummaryValue>{basicInfo.name || 'Sin nombre'}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>Objetivo</SummaryLabel>
            <SummaryValue>{basicInfo.objective || 'No definido'}</SummaryValue>
          </SummaryRow>
          <SummaryLabel>Grupos musculares</SummaryLabel>
          <ChipsContainer>
            {basicInfo.muscleGroups.length > 0 ? (
              basicInfo.muscleGroups.map((group) => (
                <Chip key={group}>
                  <ChipText>{group}</ChipText>
                </Chip>
              ))
            ) : (
              <SummaryValue>No seleccionados</SummaryValue>
            )}
          </ChipsContainer>
        </SummaryCard>
      </StepSection>

      <StepSection>
        <SectionLabel>Ejercicios ({exercises.length})</SectionLabel>
        <SummaryCard>
          {exercises.length === 0 ? (
            <SummaryValue>No hay ejercicios agregados</SummaryValue>
          ) : (
            exercises.map((exercise, index) => (
              <ExerciseItem key={exercise.id}>
                <ExerciseName>
                  {index + 1}. {exercise.name || 'Sin nombre'}
                </ExerciseName>
                <ExerciseDetails>
                  {exercise.sets} series × {exercise.reps} reps
                </ExerciseDetails>
              </ExerciseItem>
            ))
          )}
        </SummaryCard>
      </StepSection>
    </StepScrollContainer>
  );
}
