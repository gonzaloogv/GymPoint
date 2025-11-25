import { useMemo } from 'react';
import { DailyChallenge } from '@/domain';
import Table, { Column } from '../ui/Table';
import { Badge, Button } from '../ui';

interface DailyChallengeTableProps {
  challenges: DailyChallenge[];
  isLoading: boolean;
  onToggleActive: (challenge: DailyChallenge) => void;
  onDelete: (challenge: DailyChallenge) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export const DailyChallengeTable = ({
  challenges,
  isLoading,
  onToggleActive,
  onDelete,
  isToggling,
  isDeleting,
}: DailyChallengeTableProps) => {
  const columns = useMemo<Column<DailyChallenge>[]>(() => {
    return [
      {
        key: 'challenge_date',
        label: 'Fecha',
        render: (challenge) => <span className="text-sm">{challenge.challenge_date}</span>,
      },
      {
        key: 'title',
        label: 'Titulo',
        render: (challenge) => (
          <div className="max-w-xs">
            <p className="font-medium text-text dark:text-text-dark">{challenge.title}</p>
            {challenge.description && (
              <p className="truncate text-xs text-text-muted">{challenge.description}</p>
            )}
          </div>
        ),
      },
      {
        key: 'challenge_type',
        label: 'Tipo',
        render: (challenge) => <span className="text-sm">{challenge.challenge_type}</span>,
      },
      {
        key: 'target_value',
        label: 'Objetivo',
        render: (challenge) => (
          <span className="text-sm">
            {challenge.target_value} {challenge.target_unit ?? ''}
          </span>
        ),
      },
      {
        key: 'tokens_reward',
        label: 'Tokens',
        render: (challenge) => <span className="text-sm">{challenge.tokens_reward}</span>,
      },
      {
        key: 'auto_generated',
        label: 'Origen',
        render: (challenge) => (
          <Badge variant={challenge.auto_generated ? 'free' : 'active'}>
            {challenge.auto_generated ? 'Automatico' : 'Manual'}
          </Badge>
        ),
      },
      {
        key: 'actions',
        label: 'Acciones',
        render: (challenge) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant={challenge.is_active ? 'secondary' : 'success'}
              onClick={() => onToggleActive(challenge)}
              disabled={isToggling}
            >
              {challenge.is_active ? 'Desactivar' : 'Activar'}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(challenge)}
              disabled={isDeleting}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ];
  }, [isDeleting, isToggling, onDelete, onToggleActive]);

  return (
    <Table
      columns={columns}
      data={challenges}
      rowKey="id_challenge"
      loading={isLoading}
      emptyMessage="No hay desafios para el rango seleccionado."
      aria-label="Lista de desafios diarios"
    />
  );
};
