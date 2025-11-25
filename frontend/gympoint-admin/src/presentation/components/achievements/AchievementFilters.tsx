import type { AchievementCategory } from '@/domain';
import { Input, Select, Badge, Button } from '../ui';

const CATEGORY_OPTIONS: Array<{ label: string; value: AchievementCategory | 'ALL' }> = [
  { label: 'Todas las categorias', value: 'ALL' },
  { label: 'Onboarding', value: 'ONBOARDING' },
  { label: 'Rachas', value: 'STREAK' },
  { label: 'Frecuencia', value: 'FREQUENCY' },
  { label: 'Asistencias', value: 'ATTENDANCE' },
  { label: 'Rutinas', value: 'ROUTINE' },
  { label: 'Desafios', value: 'CHALLENGE' },
  { label: 'Progreso', value: 'PROGRESS' },
  { label: 'Tokens', value: 'TOKEN' },
  { label: 'Social', value: 'SOCIAL' },
];

interface AchievementFiltersProps {
  selectedCategory: AchievementCategory | 'ALL';
  onCategoryChange: (value: AchievementCategory | 'ALL') => void;
  includeInactive: boolean;
  onIncludeInactiveChange: (value: boolean) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  activeCount: number;
  inactiveCount: number;
  onReset?: () => void;
}

export const AchievementFilters = ({
  selectedCategory,
  onCategoryChange,
  includeInactive,
  onIncludeInactiveChange,
  searchTerm,
  onSearchTermChange,
  activeCount,
  inactiveCount,
  onReset,
}: AchievementFiltersProps) => {
  const total = activeCount + inactiveCount;

  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm dark:border-border-dark dark:bg-card-dark md:grid-cols-2 lg:grid-cols-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-text dark:text-text-dark">Buscar logro</label>
        <Input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Nombre, codigo o descripcion..."
          className="mt-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text dark:text-text-dark">Categoria</label>
        <Select
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value as AchievementCategory | 'ALL')}
          className="mt-2"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text dark:text-text-dark">Incluir inactivos</span>
          <Button
            variant={includeInactive ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onIncludeInactiveChange(!includeInactive)}
          >
            {includeInactive ? 'Si' : 'No'}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Badge variant="active">{activeCount} activos</Badge>
          <Badge variant="inactive">{inactiveCount} inactivos</Badge>
          <Badge variant="pending">{total} totales</Badge>
        </div>

        {onReset && (
          <Button variant="secondary" size="sm" onClick={onReset}>
            Restablecer filtros
          </Button>
        )}
      </div>
    </div>
  );
};
