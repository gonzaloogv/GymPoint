import { useState } from 'react';
import { useRoutineTemplates, useCreateRoutineTemplate, useUpdateRoutineTemplate, useDeleteRoutineTemplate, useExercises } from '../hooks';
import { Card, Loading } from '../components';
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

  // Form state
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedExercises.length === 0) {
      alert('❌ Debes agregar al menos 1 ejercicio a la plantilla');
      return;
    }

    try {
      const dto: CreateRoutineTemplateDTO = {
        routine_name: formData.routine_name,
        description: formData.description,
        recommended_for: formData.recommended_for,
        template_order: formData.template_order,
        exercises: formData.selectedExercises,
      };
      await createMutation.mutateAsync(dto);
      alert('✅ Plantilla creada exitosamente');
      resetForm();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'No se pudo crear la plantilla'}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      const dto: UpdateRoutineTemplateDTO = {
        id_routine: editingTemplate.id_routine,
        routine_name: formData.routine_name,
        description: formData.description,
        recommended_for: formData.recommended_for,
        template_order: formData.template_order,
      };
      await updateMutation.mutateAsync(dto);
      alert('✅ Plantilla actualizada exitosamente');
      resetForm();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'No se pudo actualizar la plantilla'}`);
    }
  };

  const handleEdit = (template: RoutineTemplate) => {
    setEditingTemplate(template);
    setFormData({
      routine_name: template.routine_name,
      description: template.description || '',
      recommended_for: template.recommended_for || 'BEGINNER',
      template_order: template.template_order,
      selectedExercises: [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la plantilla "${name}"?\n\nEsto eliminará permanentemente la plantilla y sus ejercicios asociados.`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      alert('✅ Plantilla eliminada exitosamente');
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error?.message || 'No se pudo eliminar la plantilla'}`);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({
      routine_name: '',
      description: '',
      recommended_for: 'BEGINNER',
      template_order: 0,
      selectedExercises: [],
    });
  };

  const addExercise = (exerciseId: number) => {
    if (formData.selectedExercises.some((e) => e.id_exercise === exerciseId)) {
      alert('Este ejercicio ya está agregado');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      selectedExercises: [
        ...prev.selectedExercises,
        {
          id_exercise: exerciseId,
          series: 3,
          reps: 10,
          order: prev.selectedExercises.length + 1,
        },
      ],
    }));
  };

  const removeExercise = (exerciseId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedExercises: prev.selectedExercises
        .filter((e) => e.id_exercise !== exerciseId)
        .map((e, idx) => ({ ...e, order: idx + 1 })),
    }));
  };

  const updateExerciseDetails = (exerciseId: number, field: 'series' | 'reps', value: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedExercises: prev.selectedExercises.map((e) =>
        e.id_exercise === exerciseId ? { ...e, [field]: value } : e
      ),
    }));
  };

  const getExerciseName = (id: number): string => {
    return exercises?.find((ex) => ex.id_exercise === id)?.exercise_name || `Ejercicio #${id}`;
  };

  const filteredTemplates = templates?.filter((template) => {
    const matchesDifficulty = filterDifficulty === 'ALL' || template.recommended_for === filterDifficulty;
    const matchesSearch = template.routine_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  const getDifficultyBadge = (difficulty: RoutineDifficulty | null) => {
    if (!difficulty) return <span className="difficulty-badge">Sin clasificar</span>;
    const option = DIFFICULTY_OPTIONS.find((opt) => opt.value === difficulty);
    return (
      <span className="difficulty-badge" style={{ backgroundColor: option?.color }}>
        {option?.icon} {option?.label}
      </span>
    );
  };

  const getCounts = () => {
    if (!templates) return { all: 0, beginner: 0, intermediate: 0, advanced: 0 };
    return {
      all: templates.length,
      beginner: templates.filter((t) => t.recommended_for === 'BEGINNER').length,
      intermediate: templates.filter((t) => t.recommended_for === 'INTERMEDIATE').length,
      advanced: templates.filter((t) => t.recommended_for === 'ADVANCED').length,
    };
  };

  const counts = getCounts();

  if (isLoading) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>💪 Plantillas de Rutinas</h1>
          <p className="page-subtitle">Gestiona las rutinas predefinidas para los usuarios</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Cancelar' : '➕ Nueva Plantilla'}
        </button>
      </div>

      {showForm && (
        <Card title={editingTemplate ? '✏️ Editar Plantilla' : '➕ Nueva Plantilla'}>
          <form onSubmit={editingTemplate ? handleUpdate : handleCreate} className="routine-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre de la Rutina *</label>
                <input
                  type="text"
                  value={formData.routine_name}
                  onChange={(e) => setFormData({ ...formData, routine_name: e.target.value })}
                  placeholder="Ej: Rutina Full Body Principiante"
                  required
                />
              </div>

              <div className="form-group">
                <label>Dificultad *</label>
                <select
                  value={formData.recommended_for}
                  onChange={(e) => setFormData({ ...formData, recommended_for: e.target.value as RoutineDifficulty })}
                  required
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Orden de Visualización</label>
                <input
                  type="number"
                  value={formData.template_order}
                  onChange={(e) => setFormData({ ...formData, template_order: Number(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe la rutina y sus beneficios..."
                rows={3}
              />
            </div>

            {!editingTemplate && (
              <>
                <div className="exercise-section">
                  <h3>📋 Ejercicios de la Rutina ({formData.selectedExercises.length})</h3>
                  
                  {formData.selectedExercises.length > 0 ? (
                    <div className="selected-exercises">
                      {formData.selectedExercises.map((ex) => (
                        <div key={ex.id_exercise} className="exercise-item">
                          <span className="exercise-order">#{ex.order}</span>
                          <span className="exercise-name">{getExerciseName(ex.id_exercise)}</span>
                          <div className="exercise-details">
                            <label>
                              Series:
                              <input
                                type="number"
                                value={ex.series}
                                onChange={(e) => updateExerciseDetails(ex.id_exercise, 'series', Number(e.target.value))}
                                min="1"
                                max="10"
                              />
                            </label>
                            <label>
                              Reps:
                              <input
                                type="number"
                                value={ex.reps}
                                onChange={(e) => updateExerciseDetails(ex.id_exercise, 'reps', Number(e.target.value))}
                                min="1"
                                max="50"
                              />
                            </label>
                          </div>
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeExercise(ex.id_exercise)}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No hay ejercicios agregados. Selecciona al menos 1.</p>
                  )}

                  <div className="exercise-selector">
                    <label>Agregar Ejercicio:</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addExercise(Number(e.target.value));
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">-- Selecciona un ejercicio --</option>
                      {exercises?.map((exercise) => (
                        <option
                          key={exercise.id_exercise}
                          value={exercise.id_exercise}
                          disabled={formData.selectedExercises.some((e) => e.id_exercise === exercise.id_exercise)}
                        >
                          {exercise.exercise_name}
                          {exercise.muscle_group ? ` (${exercise.muscle_group})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {editingTemplate && (
              <p className="info-message">
                ℹ️ Solo se pueden editar los metadatos de la plantilla. Para modificar ejercicios, crea una nueva plantilla.
              </p>
            )}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTemplate ? 'Actualizar Plantilla' : 'Crear Plantilla'}
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
              placeholder="🔍 Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          <div className="difficulty-tabs">
            <button
              className={`tab ${filterDifficulty === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterDifficulty('ALL')}
            >
              Todas <span className="count">{counts.all}</span>
            </button>
            <button
              className={`tab ${filterDifficulty === 'BEGINNER' ? 'active' : ''}`}
              onClick={() => setFilterDifficulty('BEGINNER')}
            >
              🟢 Principiante <span className="count">{counts.beginner}</span>
            </button>
            <button
              className={`tab ${filterDifficulty === 'INTERMEDIATE' ? 'active' : ''}`}
              onClick={() => setFilterDifficulty('INTERMEDIATE')}
            >
              🟡 Intermedio <span className="count">{counts.intermediate}</span>
            </button>
            <button
              className={`tab ${filterDifficulty === 'ADVANCED' ? 'active' : ''}`}
              onClick={() => setFilterDifficulty('ADVANCED')}
            >
              🔴 Avanzado <span className="count">{counts.advanced}</span>
            </button>
          </div>
        </div>

        <div className="templates-grid">
          {filteredTemplates && filteredTemplates.length > 0 ? (
            filteredTemplates
              .sort((a, b) => a.template_order - b.template_order)
              .map((template) => (
                <div key={template.id_routine} className="template-card">
                  <div className="template-header">
                    <h3>{template.routine_name}</h3>
                    {getDifficultyBadge(template.recommended_for)}
                  </div>
                  <p className="template-description">{template.description || 'Sin descripción'}</p>
                  <div className="template-meta">
                    <span>📋 Orden: {template.template_order}</span>
                  </div>
                  <div className="template-actions">
                    <button className="btn-edit" onClick={() => handleEdit(template)}>
                      ✏️ Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(template.id_routine, template.routine_name)}
                      disabled={deleteMutation.isPending}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p className="empty-state">No se encontraron plantillas</p>
          )}
        </div>
      </Card>
    </div>
  );
};

