import { useState, useEffect } from 'react';
import { useRoutineTemplates, useCreateRoutineTemplate, useUpdateRoutineTemplate, useDeleteRoutineTemplate, useExercises } from '../hooks';
import { Card, Loading, Button, Input, Select, Textarea, Badge } from '../components';
import { RoutineTemplate, CreateRoutineTemplateDTO, UpdateRoutineTemplateDTO, Exercise, DIFFICULTY_OPTIONS, RoutineDifficulty } from '@/domain';

export const RoutineTemplates = () => {
  const { data: templates, isLoading } = useRoutineTemplates();
  const { data: exercises } = useExercises();
  const createMutation = useCreateRoutineTemplate();
  const updateMutation = useUpdateRoutineTemplate();
  const deleteMutation = useDeleteRoutineTemplate();

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RoutineTemplate | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<'ALL' | RoutineDifficulty>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<{
    routine_name: string;
    description: string;
    recommended_for: RoutineDifficulty;
    template_order: number;
    selectedExercises: { id_exercise: number; series: number; reps: number; order: number }[];
  }>({
    routine_name: '',
    description: '',
    recommended_for: 'BEGINNER',
    template_order: 0,
    selectedExercises: [],
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({ routine_name: '', description: '', recommended_for: 'BEGINNER', template_order: 0, selectedExercises: [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate && formData.selectedExercises.length === 0) {
      alert('❌ Debes agregar al menos 1 ejercicio');
      return;
    }
    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({ id_routine: editingTemplate.id_routine, routine_name: formData.routine_name, description: formData.description, recommended_for: formData.recommended_for, template_order: formData.template_order });
      } else {
        await createMutation.mutateAsync({ routine_name: formData.routine_name, description: formData.description, recommended_for: formData.recommended_for, template_order: formData.template_order, exercises: formData.selectedExercises });
      }
      alert(`✅ Plantilla ${editingTemplate ? 'actualizada' : 'creada'} exitosamente`);
      resetForm();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'Ocurrió un error'}`);
    }
  };

  const handleEdit = (template: RoutineTemplate) => {
    setEditingTemplate(template);
    setFormData({ routine_name: template.routine_name, description: template.description || '', recommended_for: template.recommended_for || 'BEGINNER', template_order: template.template_order, selectedExercises: [] });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`¿Eliminar la plantilla "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const addExercise = (exerciseId: number) => {
    if (formData.selectedExercises.some(e => e.id_exercise === exerciseId)) return;
    setFormData(prev => ({ ...prev, selectedExercises: [...prev.selectedExercises, { id_exercise: exerciseId, series: 3, reps: 10, order: prev.selectedExercises.length + 1 }] }));
  };

  const removeExercise = (exerciseId: number) => {
    setFormData(prev => ({ ...prev, selectedExercises: prev.selectedExercises.filter(e => e.id_exercise !== exerciseId).map((e, i) => ({ ...e, order: i + 1 })) }));
  };

  const updateExerciseDetails = (exerciseId: number, field: 'series' | 'reps', value: number) => {
    setFormData(prev => ({ ...prev, selectedExercises: prev.selectedExercises.map(e => e.id_exercise === exerciseId ? { ...e, [field]: value } : e) }));
  };

  const getExerciseName = (id: number) => exercises?.find(ex => ex.id_exercise === id)?.exercise_name || `Ejercicio #${id}`;

  const filteredTemplates = templates?.filter(t => (filterDifficulty === 'ALL' || t.recommended_for === filterDifficulty) && t.routine_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const counts = { all: templates?.length || 0, BEGINNER: templates?.filter(t => t.recommended_for === 'BEGINNER').length || 0, INTERMEDIATE: templates?.filter(t => t.recommended_for === 'INTERMEDIATE').length || 0, ADVANCED: templates?.filter(t => t.recommended_for === 'ADVANCED').length || 0 };

  if (isLoading) return <Loading fullPage />;

  return (
    <div className="p-6 bg-bg dark:bg-bg-dark min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">💪 Plantillas de Rutinas</h1>
          <p className="text-text-muted">Gestiona las rutinas predefinidas para los usuarios</p>
        </div>
        <Button onClick={() => { showForm ? resetForm() : setShowForm(true); }} variant={showForm ? 'secondary' : 'primary'}>{showForm ? '❌ Cancelar' : '➕ Nueva Plantilla'}</Button>
      </div>

      {showForm ? (
        <Card title={editingTemplate ? '✏️ Editar Plantilla' : '➕ Nueva Plantilla'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Nombre de la Rutina *" value={formData.routine_name} onChange={e => setFormData({ ...formData, routine_name: e.target.value })} required />
              <Select label="Dificultad *" value={formData.recommended_for} onChange={e => setFormData({ ...formData, recommended_for: e.target.value as RoutineDifficulty })} options={DIFFICULTY_OPTIONS.map(o => ({ value: o.value, label: `${o.icon} ${o.label}` }))} />
              <Input label="Orden" type="number" value={formData.template_order} onChange={e => setFormData({ ...formData, template_order: Number(e.target.value) })} />
            </div>
            <Textarea label="Descripción" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
            {!editingTemplate && (
              <Card title={`Ejercicios (${formData.selectedExercises.length})`}>
                <div className="space-y-4">
                  {formData.selectedExercises.map(ex => (
                    <div key={ex.id_exercise} className="flex items-center gap-4 p-2 bg-bg rounded-lg">
                      <span className="font-bold">#{ex.order}</span>
                      <span className="flex-1">{getExerciseName(ex.id_exercise)}</span>
                      <Input label="Series" type="number" value={ex.series} onChange={e => updateExerciseDetails(ex.id_exercise, 'series', Number(e.target.value))} className="w-20" />
                      <Input label="Reps" type="number" value={ex.reps} onChange={e => updateExerciseDetails(ex.id_exercise, 'reps', Number(e.target.value))} className="w-20" />
                      <Button variant="danger" size="sm" onClick={() => removeExercise(ex.id_exercise)}>🗑️</Button>
                    </div>
                  ))}
                  <Select label="Agregar Ejercicio" onChange={e => { if (e.target.value) { addExercise(Number(e.target.value)); e.target.value = ''; } }} options={[{ value: '', label: '-- Selecciona --' }, ...(exercises || []).map(ex => ({ value: ex.id_exercise, label: `${ex.exercise_name} (${ex.muscular_group})`, disabled: formData.selectedExercises.some(e => e.id_exercise === ex.id_exercise) }))]} />
                </div>
              </Card>
            )}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={createMutation.isPending || updateMutation.isPending}>{editingTemplate ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-end gap-4">
              <Input placeholder="🔍 Buscar por nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow" />
              <div className="flex gap-2">
                <Button variant={filterDifficulty === 'ALL' ? 'primary' : 'secondary'} onClick={() => setFilterDifficulty('ALL')}>Todas <Badge variant="free">{counts.all}</Badge></Button>
                <Button variant={filterDifficulty === 'BEGINNER' ? 'primary' : 'secondary'} onClick={() => setFilterDifficulty('BEGINNER')}>Principiante <Badge variant="active">{counts.BEGINNER}</Badge></Button>
                <Button variant={filterDifficulty === 'INTERMEDIATE' ? 'primary' : 'secondary'} onClick={() => setFilterDifficulty('INTERMEDIATE')}>Intermedio <Badge variant="warning">{counts.INTERMEDIATE}</Badge></Button>
                <Button variant={filterDifficulty === 'ADVANCED' ? 'primary' : 'secondary'} onClick={() => setFilterDifficulty('ADVANCED')}>Avanzado <Badge variant="danger">{counts.ADVANCED}</Badge></Button>
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates?.sort((a, b) => a.template_order - b.template_order).map(template => (
              <Card key={template.id_routine} title={template.routine_name} footer={
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleEdit(template)}>✏️ Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(template.id_routine, template.routine_name)} disabled={deleteMutation.isPending}>🗑️ Eliminar</Button>
                </div>
              }>
                <p className="text-sm text-text-muted mb-4 h-16">{template.description || 'Sin descripción'}</p>
                <div className="flex justify-between items-center">
                  <Badge variant={template.recommended_for === 'BEGINNER' ? 'active' : template.recommended_for === 'INTERMEDIATE' ? 'warning' : 'danger'}>{template.recommended_for}</Badge>
                  <span className="text-sm font-semibold">Orden: {template.template_order}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
