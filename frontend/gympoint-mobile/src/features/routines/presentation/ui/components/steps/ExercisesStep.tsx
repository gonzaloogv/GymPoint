import styled from 'styled-components/native';
import { View, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  StepScrollContainer,
  StepSection,
  Button,
  Input,
} from '@shared/components/ui';
import { sp, rad } from '@shared/styles';
import { Exercise } from '@features/routines/domain/entities/Exercise';

const SectionLabel = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
`;

const ExerciseItemCard = styled(View)`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => rad(theme, 'lg', 12)}px;
  padding: ${({ theme }) => sp(theme, 2.5)}px;
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
`;

const ExerciseHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
`;

const ExerciseTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
`;

const DeleteButton = styled(TouchableOpacity)`
  padding: ${({ theme }) => sp(theme, 0.5)}px;
`;

const FieldLabel = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.subtext};
  margin-bottom: 6px;
`;

const StyledInput = styled(Input)`
  font-size: 15px;
  padding: ${({ theme }) => theme.spacing(1.75)}px;
  margin-bottom: ${({ theme }) => sp(theme, 1.5)}px;
`;

const InputRow = styled(View)`
  flex-direction: row;
  gap: 12px;
`;

const InputWrapper = styled(View)`
  flex: 1;
`;

const InputSmall = styled(StyledInput)`
  margin-bottom: 0;
`;

const AddButton = styled(Button)`
  margin-top: ${({ theme }) => sp(theme, 1)}px;
  flex-direction: row;
  gap: 8px;
`;

const AddButtonText = styled(Text)`
  color: #fff;
  font-weight: 600;
  font-size: 15px;
`;

const EmptyText = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.subtext};
  margin: ${({ theme }) => sp(theme, 4)}px 0;
  font-size: 14px;
  line-height: 20px;
`;

type Props = {
  exercises: Exercise[];
  onChange: (exercises: Exercise[]) => void;
};

export function ExercisesStep({ exercises, onChange }: Props) {
  const addExercise = () => {
    const newExercise: Exercise = {
      id: `temp-${Date.now()}`,
      name: '',
      sets: '',
      reps: '',
      rest: 60,
      muscleGroups: [],
    };
    onChange([...exercises, newExercise]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    onChange(
      exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)),
    );
  };

  const removeExercise = (id: string) => {
    onChange(exercises.filter((ex) => ex.id !== id));
  };

  return (
    <StepScrollContainer>
      <StepSection>
        <SectionLabel>Ejercicios de la rutina</SectionLabel>
        {exercises.length === 0 && (
          <EmptyText>
            No hay ejercicios.{'\n'}Presiona el botón + para agregar.
          </EmptyText>
        )}
        {exercises.map((exercise, index) => (
          <ExerciseItemCard key={exercise.id}>
            <ExerciseHeader>
              <ExerciseTitle>Ejercicio {index + 1}</ExerciseTitle>
              <DeleteButton onPress={() => removeExercise(exercise.id)}>
                <Feather name="trash-2" size={18} color="#EF4444" />
              </DeleteButton>
            </ExerciseHeader>
            <View>
              <FieldLabel>Nombre</FieldLabel>
              <StyledInput
                value={exercise.name}
                onChangeText={(v) => updateExercise(exercise.id, 'name', v)}
                placeholder="Ej: Press de banca"
              />
            </View>
            <InputRow>
              <InputWrapper>
                <FieldLabel>Series</FieldLabel>
                <InputSmall
                  value={String(exercise.sets)}
                  onChangeText={(v) => updateExercise(exercise.id, 'sets', v)}
                  placeholder="3"
                  keyboardType="numeric"
                />
              </InputWrapper>
              <InputWrapper>
                <FieldLabel>Reps</FieldLabel>
                <InputSmall
                  value={exercise.reps}
                  onChangeText={(v) => updateExercise(exercise.id, 'reps', v)}
                  placeholder="10-12"
                />
              </InputWrapper>
            </InputRow>
          </ExerciseItemCard>
        ))}
      </StepSection>
      <AddButton onPress={addExercise}>
        <Feather name="plus" size={20} color="#fff" />
        <AddButtonText>Agregar ejercicio</AddButtonText>
      </AddButton>
    </StepScrollContainer>
  );
}
