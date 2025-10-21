import { useMemo } from 'react';
import type { AchievementDefinition, AchievementCategory, AchievementMetricType } from '@/domain';
import Table, { type Column } from '../ui/Table';
import { Badge, Button } from '../ui';

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  ONBOARDING: 'Onboarding',
  STREAK: 'Rachas',
  FREQUENCY: 'Frecuencia',
  ATTENDANCE: 'Asistencias',
  ROUTINE: 'Rutinas',
  CHALLENGE: 'Desafios',
  PROGRESS: 'Progreso',
  TOKEN: 'Tokens',
  SOCIAL: 'Social',
};

const METRIC_LABEL: Record<AchievementMetricType, string> = {
  STREAK_DAYS: 'Dias de racha',
  STREAK_RECOVERY_USED: 'Recuperaciones usadas',
  ASSISTANCE_TOTAL: 'Asistencias acumuladas',
  FREQUENCY_WEEKS_MET: 'Semanas cumpliendo objetivo',
  ROUTINE_COMPLETED_COUNT: 'Rutinas completadas',
  WORKOUT_SESSION_COMPLETED: 'Sesiones completadas',
  DAILY_CHALLENGE_COMPLETED_COUNT: 'Desafios completados',
  PR_RECORD_COUNT: 'Registros PR',
  BODY_WEIGHT_PROGRESS: 'Progreso peso corporal',
  TOKEN_BALANCE_REACHED: 'Balance de tokens',
  TOKEN_SPENT_TOTAL: 'Tokens gastados',
  ONBOARDING_STEP_COMPLETED: 'Paso onboarding',
};

const baseColumns: Column<AchievementDefinition>[] = [
  {
    key: 'code',
    label: 'Codigo',
  },
  {
    key: 'name',
    label: 'Nombre',
  },
  {
    key: 'category',
    label: 'Categoria',
    render: (item) => (
      <Badge variant="pending">{CATEGORY_LABEL[item.category] ?? item.category}</Badge>
    ),
  },
  {
    key: 'metric_type',
    label: 'Metrica',
    render: (item) => METRIC_LABEL[item.metric_type] ?? item.metric_type,
  },
  {
    key: 'target_value',
    label: 'Objetivo',
    render: (item) => (
      <span className="font-semibold text-text dark:text-text-dark">
        {item.target_value.toLocaleString()}
      </span>
    ),
  },
  {
    key: 'metadata',
    label: 'Recompensa',
    render: (item) => {
      const reward = item.metadata?.token_reward ?? 0;
      return reward > 0 ? (
        <Badge variant="active">+{reward} tokens</Badge>
      ) : (
        <span className="text-text-muted">Sin tokens</span>
      );
    },
  },
  {
    key: 'is_active',
    label: 'Estado',
    render: (item) => (
      <Badge variant={item.is_active ? 'active' : 'inactive'}>
        {item.is_active ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
];

interface AchievementTableProps {
  achievements: AchievementDefinition[];
  loading?: boolean;
  emptyMessage?: string;
  onEdit?: (achievement: AchievementDefinition) => void;
  onDelete?: (achievement: AchievementDefinition) => void;
  isProcessingId?: number | null;
}

export const AchievementTable = ({
  achievements,
  loading = false,
  emptyMessage = 'Aun no hay logros definidos',
  onEdit,
  onDelete,
  isProcessingId = null
}: AchievementTableProps) => {
  const columns = useMemo(() => {
    if (!onEdit && !onDelete) {
      return baseColumns;
    }

    const actionsColumn: Column<AchievementDefinition> = {
      key: 'actions',
      label: 'Acciones',
      render: (item) => (
        <div className="flex flex-wrap items-center gap-2">
          {onEdit && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onEdit(item)}
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={isProcessingId === item.id_achievement_definition}
              onClick={() => onDelete(item)}
            >
              {isProcessingId === item.id_achievement_definition ? 'Eliminando…' : 'Eliminar'}
            </Button>
          )}
        </div>
      )
    };

    return [...baseColumns, actionsColumn];
  }, [onEdit, onDelete, isProcessingId]);

  return (
    <Table
      aria-label="Catalogo de logros"
      caption="Listado de logros configurados en el sistema"
      columns={columns}
      data={achievements}
      rowKey="id_achievement_definition"
      loading={loading}
      emptyMessage={emptyMessage}
    />
  );
};






