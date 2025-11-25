import { FormEvent } from 'react';
import {
  DailyChallengeDifficulty,
  DailyChallengeType,
  CreateDailyChallengeDTO,
} from '@/domain';
import { Button, Card, Input, Select, Textarea } from '../ui';

interface Option {
  value: DailyChallengeType | DailyChallengeDifficulty;
  label: string;
}

interface DailyChallengeFormProps {
  title: string;
  form: CreateDailyChallengeDTO;
  typeOptions: Option[];
  difficultyOptions: Option[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: <K extends keyof CreateDailyChallengeDTO>(
    field: K,
    value: CreateDailyChallengeDTO[K],
  ) => void;
  isSubmitting: boolean;
}

export const DailyChallengeForm = ({
  title,
  form,
  typeOptions,
  difficultyOptions,
  onSubmit,
  onChange,
  isSubmitting,
}: DailyChallengeFormProps) => {
  return (
    <Card title={title}>
      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-sm text-text-muted">
          <strong>📌 Nota:</strong> Los desafíos manuales se crean para una <strong>fecha específica</strong>.
          Solo puede existir un desafío por día. Si creas uno manualmente, el sistema no generará
          uno automático para esa fecha.
        </p>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Titulo *"
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            required
          />
          <Input
            type="date"
            label="Fecha *"
            value={form.challenge_date}
            onChange={(event) => onChange('challenge_date', event.target.value)}
            required
          />
          <Select
            label="Tipo"
            value={form.challenge_type}
            onChange={(event) => onChange('challenge_type', event.target.value as DailyChallengeType)}
            options={typeOptions}
          />
          <Input
            label="Objetivo *"
            type="number"
            value={form.target_value}
            onChange={(event) => onChange('target_value', Number(event.target.value))}
            required
          />
          <Input
            label="Unidad"
            value={form.target_unit ?? ''}
            onChange={(event) => onChange('target_unit', event.target.value)}
            placeholder="min, reps, etc."
          />
          <Input
            label="Tokens"
            type="number"
            value={form.tokens_reward ?? 0}
            onChange={(event) => onChange('tokens_reward', Number(event.target.value))}
          />
          <Select
            label="Dificultad"
            value={form.difficulty ?? 'MEDIUM'}
            onChange={(event) =>
              onChange('difficulty', event.target.value as DailyChallengeDifficulty)
            }
            options={difficultyOptions}
          />
        </div>
        <Textarea
          label="Descripcion"
          value={form.description ?? ''}
          onChange={(event) => onChange('description', event.target.value)}
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            Crear desafio
          </Button>
        </div>
      </form>
    </Card>
  );
};
