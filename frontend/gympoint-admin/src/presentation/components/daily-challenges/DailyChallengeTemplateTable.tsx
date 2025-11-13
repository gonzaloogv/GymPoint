import { useMemo } from 'react';
import { DailyChallengeTemplate } from '@/domain';
import Table, { Column } from '../ui/Table';
import { Badge, Button } from '../ui';

interface DailyChallengeTemplateTableProps {
  templates: DailyChallengeTemplate[];
  isLoading: boolean;
  onToggleActive: (template: DailyChallengeTemplate) => void;
  onDelete: (template: DailyChallengeTemplate) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export const DailyChallengeTemplateTable = ({
  templates,
  isLoading,
  onToggleActive,
  onDelete,
  isToggling,
  isDeleting,
}: DailyChallengeTemplateTableProps) => {
  const columns = useMemo<Column<DailyChallengeTemplate>[]>(() => {
    return [
      {
        key: 'title',
        label: 'Titulo',
        render: (template) => (
          <div className="max-w-xs">
            <p className="font-medium text-text dark:text-text-dark">{template.title}</p>
            {template.description && (
              <p className="truncate text-xs text-text-muted">{template.description}</p>
            )}
          </div>
        ),
      },
      {
        key: 'challenge_type',
        label: 'Tipo',
        render: (template) => <span className="text-sm">{template.challenge_type}</span>,
      },
      {
        key: 'target_value',
        label: 'Objetivo',
        render: (template) => (
          <span className="text-sm">
            {template.target_value} {template.target_unit ?? ''}
          </span>
        ),
      },
      {
        key: 'tokens_reward',
        label: 'Tokens',
        render: (template) => <span className="text-sm">{template.tokens_reward}</span>,
      },
      {
        key: 'rotation_weight',
        label: 'Peso',
        render: (template) => <span className="text-sm">{template.rotation_weight}</span>,
      },
      {
        key: 'is_active',
        label: 'Estado',
        render: (template) => (
          <Badge variant={template.is_active ? 'active' : 'inactive'}>
            {template.is_active ? 'Activa' : 'Inactiva'}
          </Badge>
        ),
      },
      {
        key: 'actions',
        label: 'Acciones',
        render: (template) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant={template.is_active ? 'secondary' : 'success'}
              onClick={() => onToggleActive(template)}
              disabled={isToggling}
            >
              {template.is_active ? 'Desactivar' : 'Activar'}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(template)}
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
      data={templates}
      rowKey="id_template"
      loading={isLoading}
      emptyMessage="No hay plantillas registradas."
      aria-label="Lista de plantillas de desafios diarios"
    />
  );
};
