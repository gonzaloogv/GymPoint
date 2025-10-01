import { RoutineCard as SharedRoutineCard } from '@shared/components/ui';
import type { Routine } from '@features/routines/types';

type Props = { routine: Routine; onPress?: (r: Routine) => void };

export default function RoutineCard({ routine, onPress }: Props) {
  return <SharedRoutineCard routine={routine} onPress={onPress} />;
}
