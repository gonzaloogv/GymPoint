import React from 'react';
import { Exercise } from '@/domain';
import { Card, Input, Select, Button, Badge } from './ui';
import { UseMutationResult } from '@tanstack/react-query';
import { translateDifficulty } from '@/utils/translations';

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
    ...muscularGroups.map((group) => ({
      value: group,
      label: `${group} (${exercises.filter((exercise) => exercise.muscular_group === group).length})`,
    })),
  ];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <Input
          placeholder="Buscar ejercicio..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="flex-grow"
        />
        <Select
          label="Grupo muscular"
          value={filterMuscularGroup}
          onChange={(event) => setFilterMuscularGroup(event.target.value)}
          options={groupOptions}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border dark:border-border-dark">
        <table className="min-w-full text-text dark:text-text-dark">
          <thead className="bg-bg dark:bg-bg-dark">
            <tr>
              <th className="px-4 py-3 text-left font-semibold border-b border-border dark:border-border-dark">
                Nombre
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-border dark:border-border-dark">
                Grupo muscular
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-border dark:border-border-dark">
                Dificultad
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-border dark:border-border-dark">
                Descripcion
              </th>
              <th className="px-4 py-3 text-left font-semibold border-b border-border dark:border-border-dark">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => {
              const isDeleting =
                deleteMutation.isPending && deleteMutation.variables === exercise.id_exercise;

              return (
                <tr
                  key={exercise.id_exercise}
                  className="transition-colors hover:bg-muted dark:hover:bg-muted-dark"
                >
                  <td className="px-4 py-3 border-b border-border dark:border-border-dark font-semibold">
                    {exercise.exercise_name}
                    {exercise.video_url && (
                      <a
                        href={exercise.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-lg text-primary hover:text-primary-hover transition-colors"
                      >
                        <span className="underline text-sm">Video</span>
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-border dark:border-border-dark">
                    {exercise.muscular_group || '-'}
                  </td>
                  <td className="px-4 py-3 border-b border-border dark:border-border-dark">
                    <Badge
                      variant={
                        exercise.difficulty === 'beginner' || exercise.difficulty === 'BEGINNER'
                          ? 'active'
                          : exercise.difficulty === 'intermediate' || exercise.difficulty === 'INTERMEDIATE'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {translateDifficulty(exercise.difficulty)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 border-b border-border dark:border-border-dark text-sm text-text-muted max-w-xs truncate">
                    {exercise.description || '-'}
                  </td>
                  <td className="px-4 py-3 border-b border-border dark:border-border-dark">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onEdit(exercise)}
                        size="sm"
                        className="px-2 py-2 text-base hover:opacity-85"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => onDelete(exercise.id_exercise, exercise.exercise_name)}
                        variant="danger"
                        size="sm"
                        disabled={isDeleting}
                        className="px-2 py-2 text-base hover:opacity-85"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {exercises.length === 0 && (
          <p className="text-center py-8 text-text-muted bg-bg dark:bg-bg-dark">
            No se encontraron ejercicios.
          </p>
        )}
      </div>
    </Card>
  );
};
