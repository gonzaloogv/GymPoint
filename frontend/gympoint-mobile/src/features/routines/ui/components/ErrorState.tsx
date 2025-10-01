import { ErrorState as SharedErrorState } from '@shared/components/ui';

type Props = {
  onRetry?: () => void;
};

export default function ErrorState({ onRetry }: Props) {
  return (
    <SharedErrorState
      title="Error al cargar rutinas"
      description="Verificá tu conexión e intentá nuevamente."
      buttonText="Reintentar"
      onRetry={onRetry}
    />
  );
}
