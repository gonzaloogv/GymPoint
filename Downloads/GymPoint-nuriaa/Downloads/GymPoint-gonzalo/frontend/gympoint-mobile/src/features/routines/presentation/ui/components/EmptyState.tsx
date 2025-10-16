import { EmptyState as SharedEmptyState } from '@shared/components/ui';

type Props = {
  onCreateRoutine?: () => void;
};

export default function EmptyState({ onCreateRoutine }: Props) {
  return (
    <SharedEmptyState
      title="No tenés rutinas aún"
      description="Creá tu primera rutina o importá una plantilla."
      buttonText="Nueva rutina"
      onButtonPress={onCreateRoutine}
    />
  );
}
