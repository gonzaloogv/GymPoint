import { useState } from 'react';
import { useExercises, useCreateExercise, useUpdateExercise, useDeleteExercise, useRoutineTemplates } from '../hooks';
import { Card, Loading } from '../components';
import { Exercise, CreateExerciseDTO, UpdateExerciseDTO } from '@/domain';

export const Exercises = () => {
  const { data: exercises, isLoading } = useExercises();
  const { data: routineTemplates } = useRoutineTemplates();
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      alert('✅ Ejercicio creado exitosamente');
      resetForm();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'No se pudo crear el ejercicio'}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise) return;

    try {
      await updateMutation.mutateAsync({
        id_exercise: editingExercise.id_exercise,
        ...formData,
      });
      alert('✅ Ejercicio actualizado exitosamente');
      resetForm();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'No se pudo actualizar el ejercicio'}`);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      exercise_name: exercise.exercise_name,
      description: exercise.description || '',
      muscular_group: exercise.muscular_group || '',
      equipment_needed: exercise.equipment_needed || '',
      difficulty: exercise.difficulty || '',
      instructions: exercise.instructions || '',
      video_url: exercise.video_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el ejercicio "${name}"?\n\n⚠️ ADVERTENCIA: Esta acción es irreversible.`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      alert('✅ Ejercicio eliminado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || '';
      
      // Detectar diferentes tipos de errores de foreign key
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('FOREIGN KEY')) {
        let detailedMessage = '⚠️ No se puede eliminar este ejercicio porque está siendo usado en el sistema.\n\n';
        
        if (errorMessage.includes('progress_exercise')) {
          detailedMessage += '📊 Hay usuarios que tienen registros de progreso con este ejercicio.\n';
        }
        if (errorMessage.includes('routine_exercise')) {
          detailedMessage += '📋 Este ejercicio está incluido en rutinas de usuarios o plantillas.\n';
        }
        if (errorMessage.includes('workout_exercise')) {
          detailedMessage += '💪 Este ejercicio ha sido usado en entrenamientos completados.\n';
        }
        
        detailedMessage += '\nPara eliminar este ejercicio primero debes:\n';
        detailedMessage += '1. Eliminar o modificar las rutinas que lo usan\n';
        detailedMessage += '2. Eliminar el progreso asociado de usuarios\n';
        detailedMessage += '3. O considerar desactivar el ejercicio en lugar de eliminarlo';
        
        alert(detailedMessage);
      } else {
        alert(`❌ Error al eliminar: ${errorMessage || 'No se pudo eliminar el ejercicio'}`);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingExercise(null);
    setFormData({
      exercise_name: '',
      description: '',
      muscular_group: '',
      equipment_needed: '',
      difficulty: '',
      instructions: '',
      video_url: '',
    });
  };

  const getRoutinesUsingExercise = (exerciseId: number) => {
    if (!routineTemplates) return [];
    // Aquí necesitaríamos que el backend retorne los ejercicios con cada rutina
    // Por ahora retornamos vacío
    return [];
  };

  const getMuscularGroups = () => {
    if (!exercises) return [];
    const groups = new Set(exercises.map(e => e.muscular_group).filter(Boolean));
    return Array.from(groups).sort();
  };

  const filteredExercises = exercises?.filter((exercise) => {
    const matchesSearch = exercise.exercise_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = filterMuscularGroup === 'ALL' || exercise.muscular_group === filterMuscularGroup;
    return matchesSearch && matchesMuscle;
  });

  const muscularGroups = getMuscularGroups();

  if (isLoading) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>💪 Gestión de Ejercicios</h1>
          <p className="page-subtitle">Administra el catálogo de ejercicios disponibles para rutinas</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Cancelar' : '➕ Nuevo Ejercicio'}
        </button>
      </div>

      {showForm && (
        <Card title={editingExercise ? '✏️ Editar Ejercicio' : '➕ Nuevo Ejercicio'}>
          <form onSubmit={editingExercise ? handleUpdate : handleCreate} className="exercise-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre del Ejercicio *</label>
                <input
                  type="text"
                  value={formData.exercise_name}
                  onChange={(e) => setFormData({ ...formData, exercise_name: e.target.value })}
                  placeholder="Ej: Press de Banca"
                  required
                />
              </div>

              <div className="form-group">
                <label>Grupo Muscular</label>
                <input
                  type="text"
                  value={formData.muscular_group}
                  onChange={(e) => setFormData({ ...formData, muscular_group: e.target.value })}
                  placeholder="Ej: Pecho"
                />
              </div>

              <div className="form-group">
                <label>Equipamiento</label>
                <input
                  type="text"
                  value={formData.equipment_needed}
                  onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })}
                  placeholder="Ej: Barra, Discos"
                />
              </div>

              <div className="form-group">
                <label>Dificultad</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el ejercicio..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Instrucciones</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Instrucciones paso a paso..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>URL del Video</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingExercise ? 'Actualizar Ejercicio' : 'Crear Ejercicio'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Buscar ejercicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          <div className="muscle-group-filter">
            <label>Grupo Muscular:</label>
            <select value={filterMuscularGroup} onChange={(e) => setFilterMuscularGroup(e.target.value)}>
              <option value="ALL">Todos ({exercises?.length || 0})</option>
              {muscularGroups.map((group) => (
                <option key={group} value={group}>
                  {group} ({exercises?.filter(e => e.muscular_group === group).length || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="exercises-table">
          {filteredExercises && filteredExercises.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Grupo Muscular</th>
                  <th>Equipamiento</th>
                  <th>Dificultad</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercises.map((exercise) => (
                  <tr key={exercise.id_exercise}>
                    <td className="exercise-name-cell">
                      <strong>{exercise.exercise_name}</strong>
                      {exercise.video_url && (
                        <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="video-link">
                          🎥
                        </a>
                      )}
                    </td>
                    <td>{exercise.muscular_group || '-'}</td>
                    <td>{exercise.equipment_needed || '-'}</td>
                    <td>
                      {exercise.difficulty && (
                        <span className={`difficulty-tag ${exercise.difficulty.toLowerCase()}`}>
                          {exercise.difficulty}
                        </span>
                      )}
                    </td>
                    <td className="description-cell">{exercise.description || '-'}</td>
                    <td className="actions-cell">
                      <button className="btn-icon" onClick={() => handleEdit(exercise)} title="Editar">
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(exercise.id_exercise, exercise.exercise_name)}
                        disabled={deleteMutation.isPending}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">No se encontraron ejercicios</p>
          )}
        </div>
      </Card>
    </div>
  );
};

