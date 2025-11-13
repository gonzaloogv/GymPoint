import { useState, useMemo } from 'react';
import { useExercises, useCreateExercise, useUpdateExercise, useDeleteExercise } from '../hooks';
import { Loading, Button, ExercisesList, ExerciseForm } from '../components';
import { Exercise, CreateExerciseDTO, UpdateExerciseDTO } from '@/domain';

export const Exercises = () => {
  const { data: exercises, isLoading, isError, error } = useExercises();
  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const deleteMutation = useDeleteExercise();

  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscularGroup, setFilterMuscularGroup] = useState('ALL');

  const handleApiError = (err: any, context: string) => {
    const errorMessage = err.response?.data?.error?.message || 'Ocurrió un error inesperado';
    console.error(`Error en ${context}:`, err);
    alert(`❌ Error en ${context}: ${errorMessage}`);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingExercise(null);
  };

  const handleSubmit = async (data: CreateExerciseDTO | UpdateExerciseDTO) => {
    try {
      const isUpdating = 'id_exercise' in data;
      if (isUpdating) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      alert(`✅ Ejercicio ${isUpdating ? 'actualizado' : 'creado'} exitosamente`);
      resetForm();
    } catch (err) {
      handleApiError(err, 'id_exercise' in data ? 'actualización' : 'creación');
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      alert('✅ Ejercicio eliminado exitosamente');
    } catch (err) {
      handleApiError(err, 'eliminación');
    }
  };

  const muscularGroups = useMemo(() => 
    Array.from(new Set(exercises?.map(e => e.muscular_group).filter(Boolean) as string[] || [])).sort()
  , [exercises]);

  const filteredExercises = useMemo(() => 
    exercises?.filter(ex => 
      (ex.exercise_name.toLowerCase().includes(searchTerm.toLowerCase()) || ex.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterMuscularGroup === 'ALL' || ex.muscular_group === filterMuscularGroup)
    ) || []
  , [exercises, searchTerm, filterMuscularGroup]);

  if (isLoading) return <Loading fullPage />;
  if (isError) return <div className="p-6 text-center text-red-500"><p>❌ Error al cargar los ejercicios.</p><p className="text-sm text-text-muted">{error.message}</p></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">💪 Gestión de Ejercicios</h1>
          <p className="text-text-muted">{`Administra el catálogo de ${exercises?.length || 0} ejercicios`}</p>
        </div>
        <Button onClick={() => { setEditingExercise(null); setShowForm(!showForm); }} variant={showForm ? 'secondary' : 'primary'}>{showForm ? '❌ Cancelar' : '➕ Nuevo Ejercicio'}</Button>
      </div>

      {showForm ? (
        <ExerciseForm 
          exercise={editingExercise}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      ) : (
        <ExercisesList 
          exercises={filteredExercises}
          muscularGroups={muscularGroups}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterMuscularGroup={filterMuscularGroup}
          setFilterMuscularGroup={setFilterMuscularGroup}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteMutation={deleteMutation}
          totalExercises={exercises?.length || 0}
        />
      )}
    </div>
  );
};
