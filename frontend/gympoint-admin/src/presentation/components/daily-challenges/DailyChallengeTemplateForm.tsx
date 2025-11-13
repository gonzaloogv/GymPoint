import { FormEvent } from 'react';
import {
  CreateDailyChallengeTemplateDTO,
  DailyChallengeDifficulty,
  DailyChallengeType,
} from '@/domain';
import { Button, Card, Input, Select, Textarea } from '../ui';

interface Option {
  value: DailyChallengeType | DailyChallengeDifficulty;
  label: string;
}

interface DailyChallengeTemplateFormProps {
  title: string;
  form: CreateDailyChallengeTemplateDTO;
  typeOptions: Option[];
  difficultyOptions: Option[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: <K extends keyof CreateDailyChallengeTemplateDTO>(
    field: K,
    value: CreateDailyChallengeTemplateDTO[K],
  ) => void;
  isSubmitting: boolean;
}

export const DailyChallengeTemplateForm = ({
  title,
  form,
  typeOptions,
  difficultyOptions,
  onSubmit,
  onChange,
  isSubmitting,
}: DailyChallengeTemplateFormProps) => {
  return (
    <Card title={title}>
      <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <p className="text-sm text-text-muted">
          <strong>🔄 Info:</strong> Las plantillas NO tienen fecha asignada. Se usan para la <strong>rotación automática</strong>.
          El <strong>peso</strong> define la probabilidad de selección (peso 3 = triple probabilidad que peso 1).
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
          <Input
            label="Peso de rotacion"
            type="number"
            min={0}
            value={form.rotation_weight ?? 1}
            onChange={(event) => onChange('rotation_weight', Number(event.target.value))}
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
            Crear plantilla
          </Button>
        </div>
      </form>
    </Card>
  );
};
