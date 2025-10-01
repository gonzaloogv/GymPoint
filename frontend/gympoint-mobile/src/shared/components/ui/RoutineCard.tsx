import styled from 'styled-components/native';
import { Card } from './Card';
import { StatusPill } from './StatusPill';
import { MetaChip } from './MetaChip';

const TouchableCard = styled.TouchableOpacity``;

const CardContent = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.h2}px;
  font-weight: 700;
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(1)}px;
`;

const MetaRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing(1)}px 0;
`;

const ChipsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

type Routine = {
  id: string;
  name: string;
  status: 'Active' | 'Scheduled' | 'Completed';
  estimatedDuration: number;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  nextScheduled?: string;
  lastPerformed?: string;
  exercises: Array<{ id: string; name: string; sets: number | string; reps: string; rest: number; muscleGroups: string[] }>;
  muscleGroups: string[];
};

type Props = {
  routine: Routine;
  onPress?: (routine: Routine) => void;
};

function minutesToLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
}

export function RoutineCard({ routine, onPress }: Props) {
  const when =
    routine.status === 'Scheduled'
      ? `Próxima: ${routine.nextScheduled}`
      : routine.lastPerformed
        ? `Última: ${routine.lastPerformed}`
        : undefined;

  return (
    <TouchableCard onPress={() => onPress?.(routine)}>
      <Card>
        <CardContent>
          <HeaderRow>
            <Title numberOfLines={2}>{routine.name}</Title>
            <StatusPill status={routine.status} />
          </HeaderRow>

          <MetaRow>
            <Meta>{minutesToLabel(routine.estimatedDuration)}</Meta>
            <Meta>• {routine.difficulty}</Meta>
            {when ? <Meta>• {when}</Meta> : null}
          </MetaRow>

          <Divider />

          <Meta numberOfLines={2}>
            {routine.exercises.length} ejercicios •{' '}
            {routine.exercises
              .slice(0, 3)
              .map((e) => e.name)
              .join(', ')}
            {routine.exercises.length > 3 ? '…' : ''}
          </Meta>

          <ChipsContainer>
            {routine.muscleGroups.slice(0, 4).map((mg) => (
              <MetaChip key={mg}>{mg}</MetaChip>
            ))}
          </ChipsContainer>
        </CardContent>
      </Card>
    </TouchableCard>
  );
}
