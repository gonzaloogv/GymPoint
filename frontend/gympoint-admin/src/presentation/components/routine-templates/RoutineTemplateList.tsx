import React from 'react';
import { RoutineTemplate } from '@/domain';
import { Card, Button, Badge } from '../ui';
import { UseMutationResult } from '@tanstack/react-query';

interface RoutineTemplateListProps {
  templates: RoutineTemplate[];
  onEdit: (template: RoutineTemplate) => void;
  onDelete: (id: number, name: string) => void;
  deleteMutation: UseMutationResult<void, Error, number, unknown>;
}

export const RoutineTemplateList: React.FC<RoutineTemplateListProps> = ({
  templates,
  onEdit,
  onDelete,
  deleteMutation,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates
        .sort((a, b) => a.template_order - b.template_order)
        .map((template) => (
          <Card
            key={template.id_routine}
            title={template.routine_name}
            footer={
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={() => onEdit(template)}>
                  ✏️ Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(template.id_routine, template.routine_name)}
                  disabled={deleteMutation.isPending && deleteMutation.variables === template.id_routine}
                >
                  🗑️ Eliminar
                </Button>
              </div>
            }
          >
            <p className="text-sm text-text-muted mb-4 h-16 overflow-hidden">
              {template.description || 'Sin descripción'}
            </p>
            <div className="flex justify-between items-center">
              <Badge
                variant={
                  template.recommended_for === 'BEGINNER'
                    ? 'active'
                    : template.recommended_for === 'INTERMEDIATE'
                    ? 'warning'
                    : 'danger'
                }
              >
                {template.recommended_for}
              </Badge>
              <span className="text-sm font-semibold">Orden: {template.template_order}</span>
            </div>
          </Card>
        ))}
    </div>
  );
};
