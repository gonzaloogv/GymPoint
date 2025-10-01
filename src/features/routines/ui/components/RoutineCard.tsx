import styled from 'styled-components/native';
import { Routine } from '../../../types';
import { Card } from '@shared/components/ui';

const Touch = styled.TouchableOpacity``;

const Inner = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Row = styled.View`
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

const Line = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing(1)}px 0;
`;

const Chips = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Chip = styled.View`
  padding: ${({ theme }) => theme.spacing(0.5)}px ${({ theme }) => theme.spacing(1)}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background: ${({ theme }) => theme.colors.muted};
`;

const ChipText = styled.Text`
  font-size: ${({ theme }) => theme.typography.small}px;
  color: ${({ theme }) => theme.colors.text};
`;

const StatusPill = styled.View<{ status: Routine['status'] }>`
  padding: ${({ theme }) => theme.spacing(0.5)}px ${({ theme }) => theme.spacing(1)}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme, status }) =>
    status === 'Active' ? theme.colors.primary : theme.colors.card};
  border: 1px solid
    ${({ theme, status }) =>
      status === 'Active' ? theme.colors.primary : theme.colors.border};
`;

const StatusText = styled.Text<{ status: Routine['status'] }>`
  color: ${({ theme, status }) =>
    status === 'Active' ? theme.colors.onPrimary : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.small}px;
  font-weight: 600;
`;

function minutesToLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
}

type Props = { routine: Routine; onPress?: (r: Routine) => void };

export default function RoutineCard({ routine, onPress }: Props) {
  const when =
    routine.status === 'Scheduled'
      ? `Próxima: ${routine.nextScheduled}`
      : routine.lastPerformed
      ? `Última: ${routine.lastPerformed}`
      : undefined;

  return (
    <Touch onPress={() => onPress?.(routine)}>
      <Card>
        <Inner>
          <Row>
            <Title numberOfLines={2}>{routine.name}</Title>
            <StatusPill status={routine.status}>
              <StatusText status={routine.status}>
                {routine.status === 'Active'
                  ? 'Activa'
                  : routine.status === 'Scheduled'
                  ? 'Programada'
                  : 'Completada'}
              </StatusText>
            </StatusPill>
          </Row>

          <MetaRow>
            <Meta>{minutesToLabel(routine.estimatedDuration)}</Meta>
            <Meta>• {routine.difficulty}</Meta>
            {when ? <Meta>• {when}</Meta> : null}
          </MetaRow>

          <Line />

          <Meta numberOfLines={2}>
            {routine.exercises.length} ejercicios •{' '}
            {routine.exercises.slice(0, 3).map(e => e.name).join(', ')}
            {routine.exercises.length > 3 ? '…' : ''}
          </Meta>

          <Chips>
            {routine.muscleGroups.slice(0, 4).map((mg) => (
              <Chip key={mg}>
                <ChipText>{mg}</ChipText>
              </Chip>
            ))}
          </Chips>
        </Inner>
      </Card>
    </Touch>
  );
}
