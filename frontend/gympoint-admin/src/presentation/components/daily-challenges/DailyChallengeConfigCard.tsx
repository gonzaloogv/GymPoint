import { Button, Card, Input } from '../ui';

interface DailyChallengeConfigCardProps {
  autoRotation: boolean;
  cronTime: string;
  onToggleAutoRotation: () => void;
  onCronTimeChange: (value: string) => void;
  onSave: () => void;
  onRunRotation: () => void;
  onShowInstructions: () => void;
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
  onShowInstructions,
  isSaving,
  isRunning,
  isLoadingConfig,
}: DailyChallengeConfigCardProps) => {
  const toggleDisabled = isSaving || isLoadingConfig;

  // Convertir UTC a hora Argentina (UTC-3)
  const getArgentinaTime = (utcTime: string) => {
    if (!utcTime) return '';
    const [hours, minutes] = utcTime.split(':').map(Number);
    let argHours = hours - 3;
    if (argHours < 0) argHours += 24;
    return `${String(argHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <Card title="⚙️ Configuración General">
      <div className="space-y-4">
        {/* Descripción */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-text-muted">
            La rotación automática genera un desafío diario usando las plantillas activas.
            Se ejecuta cada día a la hora configurada (si está habilitada).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rotación Automática */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text dark:text-text-dark">
              Rotación automática
            </label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={autoRotation ? 'success' : 'secondary'}
                onClick={onToggleAutoRotation}
                disabled={toggleDisabled}
                className="w-32"
              >
                {autoRotation ? '✓ Activa' : '✗ Desactivada'}
              </Button>
              <span className="text-xs text-text-muted">
                {autoRotation
                  ? 'El sistema generará desafíos automáticamente'
                  : 'Debes crear desafíos manualmente'}
              </span>
            </div>
          </div>

          {/* Hora de Ejecución */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text dark:text-text-dark">
              Hora de ejecución
            </label>
            <Input
              type="time"
              value={cronTime}
              onChange={(event) => onCronTimeChange(event.target.value)}
              disabled={isLoadingConfig}
              className="max-w-xs"
            />
            <p className="text-xs text-text-muted">
              UTC: {cronTime} → Argentina: {getArgentinaTime(cronTime)} (UTC-3)
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={onSave} disabled={isSaving || isLoadingConfig} variant="primary">
            {isSaving ? 'Guardando...' : '💾 Guardar configuración'}
          </Button>
          <Button onClick={onRunRotation} disabled={isRunning} variant="secondary">
            {isRunning ? 'Ejecutando...' : '▶️ Ejecutar rotación ahora'}
          </Button>
          <Button onClick={onShowInstructions} variant="outline" size="sm">
            ❓ Cómo funciona esto
          </Button>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-text-muted">
            <strong>💡 Tip:</strong> Usa "Ejecutar rotación ahora" para generar un desafío
            manualmente si hoy no hay uno. Es útil para probar o asegurar que siempre haya
            un desafío disponible.
          </p>
        </div>
      </div>
    </Card>
  );
};
