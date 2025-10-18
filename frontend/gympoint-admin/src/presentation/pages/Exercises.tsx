import { useState } from 'react';
import { useExercises, useCreateExercise, useUpdateExercise, useDeleteExercise } from '../hooks';
import { Card, Loading, Button, Input, Select, Textarea, Badge, Alert } from '../components';
import { Exercise, CreateExerciseDTO } from '@/domain';

export const Exercises = () => {
  const { data: exercises, isLoading } = useExercises();
  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const deleteMutation = useDeleteExercise();

  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscularGroup, setFilterMuscularGroup] = useState('ALL');

  const [formData, setFormData] = useState<CreateExerciseDTO>({
    exercise_name: '',
    description: '',
    muscular_group: '',
    equipment_needed: '',
    difficulty: '',
    instructions: '',
    video_url: '',
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingExercise(null);
    setFormData({ exercise_name: '', description: '', muscular_group: '', equipment_needed: '', difficulty: '', instructions: '', video_url: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExercise) {
        await updateMutation.mutateAsync({ id_exercise: editingExercise.id_exercise, ...formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      alert(`✅ Ejercicio ${editingExercise ? 'actualizado' : 'creado'} exitosamente`);
      resetForm();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'Ocurrió un error'}`);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({ exercise_name: exercise.exercise_name, description: exercise.description || '', muscular_group: exercise.muscular_group || '', equipment_needed: exercise.equipment_needed || '', difficulty: exercise.difficulty || '', instructions: exercise.instructions || '', video_url: exercise.video_url || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar el ejercicio "${name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      alert('✅ Ejercicio eliminado exitosamente');
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'No se pudo eliminar'}`);
    }
  };

  const muscularGroups = Array.from(new Set(exercises?.map(e => e.muscular_group).filter(Boolean) || [])).sort();
  const filteredExercises = exercises?.filter(ex => 
    (ex.exercise_name.toLowerCase().includes(searchTerm.toLowerCase()) || ex.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterMuscularGroup === 'ALL' || ex.muscular_group === filterMuscularGroup)
  );

  if (isLoading) return <Loading fullPage />;

  return (
    <div className="p-6 bg-bg dark:bg-bg-dark min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">💪 Gestión de Ejercicios</h1>
          <p className="text-text-muted">Administra el catálogo de ejercicios disponibles</p>
        </div>
        <Button onClick={() => { showForm ? resetForm() : setShowForm(true); }} variant={showForm ? 'secondary' : 'primary'}>{showForm ? '❌ Cancelar' : '➕ Nuevo Ejercicio'}</Button>
      </div>

      {showForm ? (
        <Card title={editingExercise ? '✏️ Editar Ejercicio' : '➕ Nuevo Ejercicio'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input label="Nombre *" value={formData.exercise_name} onChange={e => setFormData({ ...formData, exercise_name: e.target.value })} required />
              <Input label="Grupo Muscular" value={formData.muscular_group} onChange={e => setFormData({ ...formData, muscular_group: e.target.value })} />
              <Input label="Equipamiento" value={formData.equipment_needed} onChange={e => setFormData({ ...formData, equipment_needed: e.target.value })} />
              <Select label="Dificultad" value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} options={[{value: '', label: 'Seleccionar'}, {value: 'Principiante', label: 'Principiante'}, {value: 'Intermedio', label: 'Intermedio'}, {value: 'Avanzado', label: 'Avanzado'}]} />
            </div>
            <Textarea label="Descripción" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} />
            <Textarea label="Instrucciones" value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} rows={4} />
            <Input label="URL de Video" type="url" value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} />
            <div className="flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={createMutation.isPending || updateMutation.isPending}>{editingExercise ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <Input placeholder="🔍 Buscar ejercicio..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow" />
            <Select label="Grupo Muscular" value={filterMuscularGroup} onChange={e => setFilterMuscularGroup(e.target.value)} options={[{ value: 'ALL', label: `Todos (${exercises?.length || 0})` }, ...muscularGroups.map(g => ({ value: g, label: `${g} (${exercises?.filter(e => e.muscular_group === g).length || 0})` }))]} />
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
                {filteredExercises?.map(ex => (
                  <tr key={ex.id_exercise} className="hover:bg-bg">
                    <td className="px-4 py-3 border-b border-border font-semibold">{ex.exercise_name} {ex.video_url && <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-lg">🎥</a>}</td>
                    <td className="px-4 py-3 border-b border-border">{ex.muscular_group || '-'}</td>
                    <td className="px-4 py-3 border-b border-border"><Badge variant={ex.difficulty === 'Principiante' ? 'active' : ex.difficulty === 'Intermedio' ? 'warning' : 'danger'}>{ex.difficulty || 'N/A'}</Badge></td>
                    <td className="px-4 py-3 border-b border-border text-sm text-text-muted max-w-xs truncate">{ex.description || '-'}</td>
                    <td className="px-4 py-3 border-b border-border">
                      <div className="flex gap-2">
                        <Button onClick={() => handleEdit(ex)} size="sm" className="px-2 py-2 text-base hover:opacity-85">✏️</Button>
                        <Button onClick={() => handleDelete(ex.id_exercise, ex.exercise_name)} variant="danger" size="sm" disabled={deleteMutation.isPending} className="px-2 py-2 text-base hover:opacity-85">🗑️</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExercises?.length === 0 && <p className="text-center py-8 text-text-muted">No se encontraron ejercicios.</p>}
          </div>
        </Card>
      )}
    </div>
  );
};
