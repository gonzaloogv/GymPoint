import { Button, Card, Input } from '../ui';

interface DailyChallengeConfigCardProps {
  autoRotation: boolean;
  cronTime: string;
  onToggleAutoRotation: () => void;
  onCronTimeChange: (value: string) => void;
  onSave: () => void;
  onRunRotation: () => void;
  isSaving: boolean;
  isRunning: boolean;
  isLoadingConfig: boolean;
}

export const DailyChallengeConfigCard = ({
  autoRotation,
  cronTime,
  onToggleAutoRotation,
  onCronTimeChange,
  onSave,
  onRunRotation,
  isSaving,
  isRunning,
  isLoadingConfig,
}: DailyChallengeConfigCardProps) => {
  const toggleDisabled = isSaving || isLoadingConfig;

  return (
    <Card title="Configuracion general">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-2">
          <span className="text-text dark:text-text-dark font-medium">Rotacion automatica:</span>
          <Button
            size="sm"
            variant={autoRotation ? 'success' : 'secondary'}
            onClick={onToggleAutoRotation}
            disabled={toggleDisabled}
          >
            {autoRotation ? 'Activa' : 'Desactivada'}
          </Button>
        </div>
        <Input
          type="time"
          label="Hora de ejecucion (UTC)"
          value={cronTime}
          onChange={(event) => onCronTimeChange(event.target.value)}
          disabled={isLoadingConfig}
        />
        <Button onClick={onSave} disabled={isSaving || isLoadingConfig}>
          Guardar configuracion
        </Button>
        <Button onClick={onRunRotation} disabled={isRunning}>
          Ejecutar rotacion ahora
        </Button>
      </div>
    </Card>
  );
};
