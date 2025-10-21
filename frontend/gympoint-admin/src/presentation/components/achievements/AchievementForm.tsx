import { useState } from 'react';
import type {
  AchievementCategory,
  AchievementDefinition,
  AchievementDefinitionInput,
  AchievementMetricType,
  AchievementMetadata
} from '@/domain';
import { Input, Select, Textarea, Button, Alert } from '../ui';

const CATEGORY_OPTIONS: Array<{ label: string; value: AchievementCategory }> = [
  { label: 'Onboarding', value: 'ONBOARDING' },
  { label: 'Rachas', value: 'STREAK' },
  { label: 'Frecuencia', value: 'FREQUENCY' },
  { label: 'Asistencias', value: 'ATTENDANCE' },
  { label: 'Rutinas', value: 'ROUTINE' },
  { label: 'Desafíos', value: 'CHALLENGE' },
  { label: 'Progreso', value: 'PROGRESS' },
  { label: 'Tokens', value: 'TOKEN' },
  { label: 'Social', value: 'SOCIAL' }
];

const METRIC_OPTIONS: Array<{ label: string; value: AchievementMetricType }> = [
  { label: 'Días de racha', value: 'STREAK_DAYS' },
  { label: 'Recuperaciones usadas', value: 'STREAK_RECOVERY_USED' },
  { label: 'Asistencias acumuladas', value: 'ASSISTANCE_TOTAL' },
  { label: 'Semanas cumpliendo objetivo', value: 'FREQUENCY_WEEKS_MET' },
  { label: 'Rutinas completadas', value: 'ROUTINE_COMPLETED_COUNT' },
  { label: 'Sesiones completadas', value: 'WORKOUT_SESSION_COMPLETED' },
  { label: 'Desafíos completados', value: 'DAILY_CHALLENGE_COMPLETED_COUNT' },
  { label: 'Registros PR', value: 'PR_RECORD_COUNT' },
  { label: 'Progreso de peso', value: 'BODY_WEIGHT_PROGRESS' },
  { label: 'Balance de tokens', value: 'TOKEN_BALANCE_REACHED' },
  { label: 'Tokens gastados', value: 'TOKEN_SPENT_TOTAL' },
  { label: 'Paso onboarding', value: 'ONBOARDING_STEP_COMPLETED' }
];

interface AchievementFormState {
  code: string;
  name: string;
  description: string;
  category: AchievementCategory;
  metric_type: AchievementMetricType;
  target_value: number;
  icon_url: string;
  is_active: boolean;
  token_reward: number | '';
  unlock_message: string;
}

const defaultState: AchievementFormState = {
  code: '',
  name: '',
  description: '',
  category: 'ONBOARDING',
  metric_type: 'STREAK_DAYS',
  target_value: 1,
  icon_url: '',
  is_active: true,
  token_reward: '',
  unlock_message: ''
};

interface AchievementFormProps {
  initialDefinition?: AchievementDefinition;
  onSubmit: (payload: AchievementDefinitionInput) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
}

export const AchievementForm = ({
  initialDefinition,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null
}: AchievementFormProps) => {
  const [formState, setFormState] = useState<AchievementFormState>(() => {
    if (!initialDefinition) {
      return defaultState;
    }

    const metadata = (initialDefinition.metadata || {}) as AchievementMetadata;

    return {
      code: initialDefinition.code,
      name: initialDefinition.name,
      description: initialDefinition.description || '',
      category: initialDefinition.category,
      metric_type: initialDefinition.metric_type,
      target_value: initialDefinition.target_value,
      icon_url: initialDefinition.icon_url || '',
      is_active: initialDefinition.is_active,
      token_reward: metadata?.token_reward ?? '',
      unlock_message: metadata?.unlock_message ?? ''
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof AchievementFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = field === 'is_active'
      ? event.target.value === 'true'
      : field === 'target_value'
        ? Number(event.target.value)
        : event.target.value;

    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTokenRewardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw === '') {
      setFormState((prev) => ({ ...prev, token_reward: '' }));
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      setFormState((prev) => ({ ...prev, token_reward: parsed }));
    }
  };

  const validate = (): Record<string, string> => {
    const validationErrors: Record<string, string> = {};
    if (!formState.code.trim()) {
      validationErrors.code = 'Ingresa un código';
    }
    if (!formState.name.trim()) {
      validationErrors.name = 'Ingresa un nombre';
    }
    if (!Number.isInteger(formState.target_value) || formState.target_value <= 0) {
      validationErrors.target_value = 'El objetivo debe ser un entero positivo';
    }
    if (formState.token_reward !== '' && (!Number.isInteger(formState.token_reward) || formState.token_reward < 0)) {
      validationErrors.token_reward = 'El bono de tokens debe ser un entero positivo';
    }
    return validationErrors;
  };

  const buildMetadata = (): AchievementMetadata | null => {
    const reward =
      formState.token_reward === '' || Number(formState.token_reward) <= 0
        ? undefined
        : Number(formState.token_reward);
    const message = formState.unlock_message.trim() || undefined;

    if (reward === undefined && message === undefined) {
      return null;
    }

    return {
      ...(reward !== undefined ? { token_reward: reward } : {}),
      ...(message ? { unlock_message: message } : {})
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const payload: AchievementDefinitionInput = {
      code: formState.code.trim(),
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      category: formState.category,
      metric_type: formState.metric_type,
      target_value: formState.target_value,
      icon_url: formState.icon_url.trim() || undefined,
      is_active: formState.is_active,
      metadata: buildMetadata()
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Código"
          value={formState.code}
          onChange={handleChange('code')}
          error={errors.code}
          placeholder="STREAK_30"
          required
        />
        <Input
          label="Nombre"
          value={formState.name}
          onChange={handleChange('name')}
          error={errors.name}
          placeholder="Racha de 30 días"
          required
        />
      </div>

      <Textarea
        label="Descripción"
        value={formState.description}
        onChange={handleChange('description')}
        placeholder="Texto descriptivo para el logro"
        rows={3}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Categoría"
          value={formState.category}
          onChange={handleChange('category')}
          options={CATEGORY_OPTIONS}
        />
        <Select
          label="Métrica"
          value={formState.metric_type}
          onChange={handleChange('metric_type')}
          options={METRIC_OPTIONS}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Objetivo"
          type="number"
          min={1}
          value={formState.target_value}
          onChange={handleChange('target_value')}
          error={errors.target_value}
        />
        <Input
          label="Ícono (URL)"
          value={formState.icon_url}
          onChange={handleChange('icon_url')}
          placeholder="https://..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Tokens de recompensa"
          type="number"
          min={0}
          value={formState.token_reward}
          onChange={handleTokenRewardChange}
          error={errors.token_reward}
          placeholder="Opcional"
        />
        <Input
          label="Mensaje al desbloquear"
          value={formState.unlock_message}
          onChange={handleChange('unlock_message')}
          placeholder="Opcional"
        />
      </div>

      <Select
        label="Estado"
        value={String(formState.is_active)}
        onChange={handleChange('is_active')}
        options={[
          { label: 'Activo', value: 'true' },
          { label: 'Inactivo', value: 'false' }
        ]}
      />

      {serverError && (
        <Alert type="error" message={serverError} />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
};

