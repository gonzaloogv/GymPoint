import React from 'react';
import { Exercise } from '@/domain';
import { Card, Input, Select, Button, Badge } from './ui';
import { UseMutationResult } from '@tanstack/react-query';

interface ExercisesListProps {
  exercises: Exercise[];
  muscularGroups: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterMuscularGroup: string;
  setFilterMuscularGroup: (group: string) => void;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: number, name: string) => void;
  deleteMutation: UseMutationResult<void, Error, number, unknown>;
  totalExercises: number;
}

export const ExercisesList: React.FC<ExercisesListProps> = ({
  exercises,
  muscularGroups,
  searchTerm,
  setSearchTerm,
  filterMuscularGroup,
  setFilterMuscularGroup,
  onEdit,
  onDelete,
  deleteMutation,
  totalExercises,
}) => {
  const groupOptions = [
    { value: 'ALL', label: `Todos (${totalExercises})` },
    ...muscularGroups.map(g => ({
      value: g,
      label: `${g} (${exercises.filter(e => e.muscular_group === g).length})`
    }))
  ];

  return (
    <Card>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <Input 
          placeholder="🔍 Buscar ejercicio..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="flex-grow" 
        />
        <Select 
          label="Grupo Muscular" 
          value={filterMuscularGroup} 
          onChange={e => setFilterMuscularGroup(e.target.value)} 
          options={groupOptions} 
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-bg text-left font-semibold border-b border-border">Nombre</th>
              <th className="px-4 py-3 bg-bg text-left font-semibold border-b border-border">Grupo Muscular</th>
              <th className="px-4 py-3 bg-bg text-left font-semibold border-b border-border">Dificultad</th>
              <th className="px-4 py-3 bg-bg text-left font-semibold border-b border-border">Descripción</th>
              <th className="px-4 py-3 bg-bg text-left font-semibold border-b border-border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map(ex => (
              <tr key={ex.id_exercise} className="hover:bg-bg">
                <td className="px-4 py-3 border-b border-border font-semibold">
                  {ex.exercise_name} 
                  {ex.video_url && <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-lg">🎥</a>}
                </td>
                <td className="px-4 py-3 border-b border-border">{ex.muscular_group || '-'}</td>
                <td className="px-4 py-3 border-b border-border">
                  <Badge variant={ex.difficulty === 'Principiante' ? 'active' : ex.difficulty === 'Intermedio' ? 'warning' : 'danger'}>
                    {ex.difficulty || 'N/A'}
                  </Badge>
                </td>
                <td className="px-4 py-3 border-b border-border text-sm text-text-muted max-w-xs truncate">{ex.description || '-'}</td>
                <td className="px-4 py-3 border-b border-border">
                  <div className="flex gap-2">
                    <Button onClick={() => onEdit(ex)} size="sm" className="px-2 py-2 text-base hover:opacity-85">✏️</Button>
                    <Button 
                      onClick={() => onDelete(ex.id_exercise, ex.exercise_name)} 
                      variant="danger" 
                      size="sm" 
                      disabled={deleteMutation.isPending && deleteMutation.variables === ex.id_exercise}
                      className="px-2 py-2 text-base hover:opacity-85"
                    >
                      🗑️
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {exercises.length === 0 && <p className="text-center py-8 text-text-muted">No se encontraron ejercicios.</p>}
      </div>
    </Card>
  );
};
