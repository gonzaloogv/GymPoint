import { useState, useMemo } from 'react';
import { useRoutineTemplates, useCreateRoutineTemplate, useUpdateRoutineTemplate, useDeleteRoutineTemplate, useExercises } from '../hooks';
import { Loading, Button, RoutineTemplateForm, RoutineTemplateFilters, RoutineTemplateList } from '../components';
import { RoutineTemplate, CreateRoutineTemplateDTO, UpdateRoutineTemplateDTO, RoutineDifficulty } from '@/domain';

export const RoutineTemplates = () => {
  const { data: templates, isLoading: templatesLoading, isError: templatesError, error: templatesErrorData } = useRoutineTemplates();
  const { data: exercises, isLoading: exercisesLoading, isError: exercisesError, error: exercisesErrorData } = useExercises();
  const createMutation = useCreateRoutineTemplate();
  const updateMutation = useUpdateRoutineTemplate();
  const deleteMutation = useDeleteRoutineTemplate();

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RoutineTemplate | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<'ALL' | RoutineDifficulty>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApiError = (err: any, context: string) => {
    const errorMessage = err.response?.data?.error?.message || 'Ocurrió un error inesperado';
    console.error(`Error en ${context}:`, err);
    alert(`❌ Error al ${context}: ${errorMessage}`);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleSubmit = async (data: Omit<CreateRoutineTemplateDTO, 'exercises'> | CreateRoutineTemplateDTO) => {
    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id_routine: editingTemplate.id_routine,
          ...(data as Omit<UpdateRoutineTemplateDTO, 'id_routine'>)
        });
      } else {
        await createMutation.mutateAsync(data as CreateRoutineTemplateDTO);
      }
      alert(`✅ Plantilla ${editingTemplate ? 'actualizada' : 'creada'} exitosamente`);
      resetForm();
    } catch (error) {
      handleApiError(error, editingTemplate ? 'actualizar la plantilla' : 'crear la plantilla');
    }
  };

  const handleEdit = (template: RoutineTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la plantilla "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('✅ Plantilla eliminada con éxito');
      } catch (err) {
        handleApiError(err, 'eliminar la plantilla');
      }
    }
  };

  const filteredTemplates = useMemo(() => 
    templates?.filter(t => 
      (filterDifficulty === 'ALL' || t.recommended_for === filterDifficulty) && 
      t.routine_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  , [templates, filterDifficulty, searchTerm]);

  const counts = useMemo(() => ({
    all: templates?.length || 0,
    BEGINNER: templates?.filter(t => t.recommended_for === 'BEGINNER').length || 0,
    INTERMEDIATE: templates?.filter(t => t.recommended_for === 'INTERMEDIATE').length || 0,
    ADVANCED: templates?.filter(t => t.recommended_for === 'ADVANCED').length || 0,
  }), [templates]);

  const isLoading = templatesLoading || exercisesLoading;

  if (isLoading) return <Loading fullPage />;

  if (templatesError || exercisesError) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold text-danger">Error al Cargar la Página</h1>
        {templatesError && <p className="text-text-muted">Error de Plantillas: {templatesErrorData?.message}</p>}
        {exercisesError && <p className="text-text-muted">Error de Ejercicios: {exercisesErrorData?.message}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">💪 Plantillas de Rutinas</h1>
          <p className="text-text-muted">Gestiona las rutinas predefinidas para los usuarios</p>
        </div>
        <Button onClick={() => { setEditingTemplate(null); setShowForm(true); }} variant={showForm ? 'secondary' : 'primary'}>{showForm ? '❌ Cancelar' : '➕ Nueva Plantilla'}</Button>
      </div>

      {showForm ? (
        <RoutineTemplateForm 
          template={editingTemplate}
          exercises={exercises || []}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      ) : (
        <div className="space-y-6">
          <RoutineTemplateFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterDifficulty={filterDifficulty}
            setFilterDifficulty={setFilterDifficulty}
            counts={counts}
          />
          <RoutineTemplateList 
            templates={filteredTemplates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleteMutation={deleteMutation}
          />
        </div>
      )}
    </div>
  );
};
