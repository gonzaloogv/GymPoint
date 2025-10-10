import styled from 'styled-components/native';
import { View } from 'react-native';
import { Card, MetaChip, Button } from '@shared/components/ui';
import { PredesignedRoutine } from '@features/routines/domain/entities/PredesignedRoutine';

const CardContent = styled.View`
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
  align-items: flex-start;
`;

const ImagePlaceholder = styled.View`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

const ImageText = styled.Text`
  font-size: 20px;
`;

const Content = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing(0.5)}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.h2}px;
  font-weight: 700;
`;

const DifficultyBadge = styled.Text<{ difficulty: string }>`
  font-size: ${({ theme }) => theme.typography.small}px;
  font-weight: 600;
  color: ${({ difficulty }) =>
    difficulty === 'Principiante'
      ? '#10B981'
      : difficulty === 'Intermedio'
        ? '#F59E0B'
        : '#EF4444'};
`;

const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)}px;
  margin-top: ${({ theme }) => theme.spacing(0.5)}px;
`;

const MetaText = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const ChipsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const ImportButton = styled(Button)`
  align-self: flex-start;
  padding: ${({ theme }) => theme.spacing(0.75)}px ${({ theme }) => theme.spacing(1.25)}px;
  min-height: 32px;
  flex-shrink: 0;
`;

const ImportButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryText};
  font-size: 13px;
  font-weight: 600;
`;

type Props = {
  routine: PredesignedRoutine;
  onImport: (routine: PredesignedRoutine) => void;
};

export function ImportRoutineCard({ routine, onImport }: Props) {
  const durationLabel =
    routine.duration >= 60
      ? `${Math.floor(routine.duration / 60)}h ${routine.duration % 60}m`
      : `${routine.duration} min`;

  return (
    <Card>
      <CardContent>
        <ImagePlaceholder>
          <ImageText>💪</ImageText>
        </ImagePlaceholder>

        <Content>
          <Title>{routine.name}</Title>
          <DifficultyBadge difficulty={routine.difficulty}>
            {routine.difficulty}
          </DifficultyBadge>

          <MetaRow>
            <MetaText>⏱ {durationLabel}</MetaText>
            <MetaText>• {routine.exerciseCount} ejercicios</MetaText>
          </MetaRow>

          <ChipsContainer>
            {routine.muscleGroups.map((group) => (
              <MetaChip key={group}>{group}</MetaChip>
            ))}
          </ChipsContainer>
        </Content>

        <ImportButton onPress={() => onImport(routine)}>
          <ImportButtonText>Importar</ImportButtonText>
        </ImportButton>
      </CardContent>
    </Card>
  );
}
