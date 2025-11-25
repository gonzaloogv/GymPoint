import { Button, Input } from '../ui';

export interface DailyChallengeFiltersState {
  from?: string;
  to?: string;
  include_inactive?: boolean;
}

interface DailyChallengeFiltersProps {
  filters: DailyChallengeFiltersState;
  onFilterChange: <K extends keyof DailyChallengeFiltersState>(
    field: K,
    value: DailyChallengeFiltersState[K],
  ) => void;
  onApply: () => void;
  onReset: () => void;
  isApplying: boolean;
}

export const DailyChallengeFilters = ({
  filters,
  onFilterChange,
  onApply,
  onReset,
  isApplying,
}: DailyChallengeFiltersProps) => {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-4">
      <Input
        type="date"
        label="Desde"
        value={filters.from ?? ''}
        onChange={(event) => onFilterChange('from', event.target.value)}
        className="w-48"
      />
      <Input
        type="date"
        label="Hasta"
        value={filters.to ?? ''}
        onChange={(event) => onFilterChange('to', event.target.value)}
        className="w-48"
      />
      <label className="flex items-center gap-2 text-sm text-text dark:text-text-dark">
        <input
          type="checkbox"
          checked={Boolean(filters.include_inactive)}
          onChange={(event) => onFilterChange('include_inactive', event.target.checked)}
        />
        Incluir inactivos
      </label>
      <div className="flex gap-2">
        <Button size="sm" onClick={onApply} disabled={isApplying}>
          Aplicar filtros
        </Button>
        <Button size="sm" variant="secondary" onClick={onReset} disabled={isApplying}>
          Limpiar
        </Button>
      </div>
    </div>
  );
};
